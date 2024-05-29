import mongoose, { ConnectOptions, Model } from 'mongoose'
import * as env from '../config/env.config'
import * as logger from './logger'
import Booking, { BOOKING_EXPIRE_AT_INDEX_NAME } from '../models/Booking'
import Location from '../models/Location'
import LocationValue from '../models/LocationValue'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'
import Property from '../models/Property'
import PushToken from '../models/PushToken'
import Token, { TOKEN_EXPIRE_AT_INDEX_NAME } from '../models/Token'
import User from '../models/User'

/**
 * Connect to database.
 *
 * @export
 * @async
 * @param {string} uri
 * @param {boolean} ssl
 * @param {boolean} debug
 * @returns {Promise<boolean>}
 */
export const connect = async (uri: string, ssl: boolean, debug: boolean): Promise<boolean> => {
  let options: ConnectOptions = {}

  if (ssl) {
    options = {
      tls: true,
      tlsCertificateKeyFile: env.DB_SSL_CERT,
      tlsCAFile: env.DB_SSL_CA,
    }
  }

  mongoose.set('debug', debug)
  mongoose.Promise = globalThis.Promise

  try {
    await mongoose.connect(uri, options)
    logger.info('Database is connected')
    return true
  } catch (err) {
    logger.error('Cannot connect to the database:', err)
    return false
  }
}

/**
 * Close database connection.
 *
 * @export
 * @async
 * @param {boolean} force
 * @returns {Promise<void>}
 */
export const close = async (force: boolean = false): Promise<void> => {
  await mongoose.connection.close(force)
}

/**
 * Create Token TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createTokenIndex = async (): Promise<void> => {
  await Token.collection.createIndex({ expireAt: 1 }, { name: TOKEN_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.TOKEN_EXPIRE_AT, background: true })
}

/**
 * Create Booking TTL index.
 *
 * @async
 * @returns {Promise<void>}
 */
const createBookingIndex = async (): Promise<void> => {
  await Booking.collection.createIndex({ expireAt: 1 }, { name: BOOKING_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.BOOKING_EXPIRE_AT, background: true })
}

const createCollection = async<T>(model: Model<T>) => {
  try {
    await model.collection.indexes()
  } catch (err) {
    await model.createCollection()
    await model.createIndexes()
  }
}

/**
 * Initialize database.
 *
 * @async
 * @returns {Promise<boolean>}
 */
export const initialize = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState) {
      await createCollection<env.Booking>(Booking)
      await createCollection<env.Location>(Location)
      await createCollection<env.LocationValue>(LocationValue)
      await createCollection<env.Notification>(Notification)
      await createCollection<env.NotificationCounter>(NotificationCounter)
      await createCollection<env.Property>(Property)
      await createCollection<env.PushToken>(PushToken)
      await createCollection<env.Token>(Token)
      await createCollection<env.User>(User)
    }

    //
    // Update Booking TTL index if configuration changes
    //
    const bookingIndexes = await Booking.collection.indexes()
    const bookingIndex = bookingIndexes.find((index: any) => index.name === BOOKING_EXPIRE_AT_INDEX_NAME && index.expireAfterSeconds !== env.BOOKING_EXPIRE_AT)
    if (bookingIndex) {
      try {
        await Booking.collection.dropIndex(bookingIndex.name!)
      } catch (err) {
        logger.error('Failed dropping Booking TTL index', err)
      } finally {
        await createBookingIndex()
        await Booking.createIndexes()
      }
    }

    //
    // Update Token TTL index if configuration changes
    //
    const tokenIndexes = await Token.collection.indexes()
    const tokenIndex = tokenIndexes.find((index: any) => index.name.includes(TOKEN_EXPIRE_AT_INDEX_NAME))
    if (tokenIndex) {
      try {
        await Token.collection.dropIndex(tokenIndex.name!)
      } catch (err) {
        logger.error('Failed dropping Token TTL index', err)
      } finally {
        await createTokenIndex()
        await Token.createIndexes()
      }
    }

    return true
  } catch (err) {
    logger.error('An error occured while initializing database:', err)
    return false
  }
}

/**
 * Initialize locations.
 * If a new language is added, english values will be added by default with the new language.
 * The new language values must be updated from the backend.
 *
 * @async
 * @returns {*}
 */
export const InitializeLocations = async () => {
  try {
    logger.info('Initializing locations...')
    const locations = await Location.find({})
      .populate<{ values: env.LocationValue[] }>({
        path: 'values',
        model: 'LocationValue',
      })

    for (const location of locations) {
      const enLocationValue = location.values.find((val) => val.language === 'en')

      if (enLocationValue) {
        for (const lang of env.LANGUAGES) {
          if (!location.values.some((val) => val.language === lang)) {
            const langLocationValue = new LocationValue({ language: lang, value: enLocationValue.value })
            await langLocationValue.save()
            const loc = await Location.findById(location.id)
            loc?.values.push(new mongoose.Types.ObjectId(String(langLocationValue.id)))
            await loc?.save()
          }
        }
      } else {
        console.log('English value not found for location:', location.id)
      }
    }
    logger.info('Locations initialized')
    return true
  } catch (err) {
    logger.error('Error while initializing locations:', err)
    return false
  }
}
