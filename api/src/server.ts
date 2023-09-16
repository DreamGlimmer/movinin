import express, { Express } from 'express'
import cors from 'cors'
import mongoose, { ConnectOptions } from 'mongoose'
import compression from 'compression'
import helmet from 'helmet'
import nocache from 'nocache'
import strings from './config/app.config'
import agencyRoutes from './routes/agencyRoutes'
import bookingRoutes from './routes/bookingRoutes'
import locationRoutes from './routes/locationRoutes'
import notificationRoutes from './routes/notificationRoutes'
import propertyRoutes from './routes/propertyRoutes'
import userRoutes from './routes/userRoutes'
import * as env from './config/env.config'

let options: ConnectOptions = {}
if (env.DB_SSL) {
    options = {
        tls: true,
        tlsCertificateKeyFile: env.DB_SSL_CERT,
        tlsCAFile: env.DB_SSL_CA,
    }
}

mongoose.set('debug', env.DB_DEBUG)
mongoose.Promise = globalThis.Promise
try {
    await mongoose.connect(env.DB_URI, options)
    console.log('Database is connected')
} catch (err) {
    console.error('Cannot connect to the database:', err)
}

const app: Express = express()
app.use(helmet.contentSecurityPolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.crossOriginEmbedderPolicy())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())
app.use(helmet.originAgentCluster())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(helmet.crossOriginOpenerPolicy())
app.use(nocache())
app.use(compression({ threshold: 0 }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use('/', agencyRoutes)
app.use('/', bookingRoutes)
app.use('/', locationRoutes)
app.use('/', notificationRoutes)
app.use('/', propertyRoutes)
app.use('/', userRoutes)

strings.setLanguage(env.DEFAULT_LANGUAGE)
export default app
