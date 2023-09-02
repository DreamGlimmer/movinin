import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as env from '../config/env.config'
import strings from '../config/app.config'
import Location from '../models/Location'
import LocationValue from '../models/LocationValue'
import Property from '../models/Property'
import * as movininTypes from 'movinin-types'

export async function validate(req: Request, res: Response) {
  const body: { language: string, name: string } = req.body
  const { language, name } = body

  try {
    const keyword = escapeStringRegexp(name)
    const options = 'i'

    const locationValue = await LocationValue.findOne({
      language: { $eq: language },
      value: { $regex: new RegExp(`^${keyword}$`), $options: options },
    })
    return locationValue ? res.sendStatus(204) : res.sendStatus(200)
  } catch (err) {
    console.error(`[location.validate]  ${strings.DB_ERROR} ${name}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function create(req: Request, res: Response) {
  const body: movininTypes.LocationName[] = req.body
  const names = body

  try {
    const values = []
    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      const locationValue = new LocationValue({
        language: name.language,
        value: name.name,
      })
      await locationValue.save()
      values.push(locationValue._id)
    }

    const location = new Location({ values })
    await location.save()
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[location.create] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params

  try {
    const location = await Location.findById(id).populate<{ values: env.LocationValue[] }>('values')

    if (location) {
      const names = req.body
      for (let i = 0; i < names.length; i++) {
        const name = names[i]
        const locationValue = location.values.filter((value) => value.language === name.language)[0]
        if (locationValue) {
          locationValue.value = name.name
          await locationValue.save()
        } else {
          const locationValue = new LocationValue({
            language: name.language,
            value: name.name,
          })
          await locationValue.save()
          location.values.push(locationValue)
          await location.save()
        }
      }
      return res.sendStatus(200)
    } else {
      console.error('[location.update] Location not found:', id)
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[location.update] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function deleteLocation(req: Request, res: Response) {
  const { id } = req.params

  try {
    const location = await Location.findByIdAndDelete(id)
    if (!location) {
      const msg = `[location.delete] Location ${id} not found`
      console.log(msg)
      return res.status(204).send(msg)
    }
    await LocationValue.deleteMany({ _id: { $in: location.values } })
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[location.delete] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function getLocation(req: Request, res: Response) {
  const { id } = req.params

  try {
    const location = await Location.findById(id).populate<{ values: env.LocationValue[] }>('values').lean()

    if (location) {
      const name = (location.values as env.LocationValue[]).filter((value) => value.language === req.params.language)[0].value
      const l = { ...location, name }
      return res.json(l)
    } else {
      console.error('[location.getLocation] Location not found:', id)
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[location.getLocation] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function getLocations(req: Request, res: Response) {
  try {
    const page = Number.parseInt(req.params.page)
    const size = Number.parseInt(req.params.size)
    const language = req.params.language
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const locations = await Location.aggregate(
      [
        {
          $lookup: {
            from: 'LocationValue',
            let: { values: '$values' },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $in: ['$_id', '$$values'] } },
                    { $expr: { $eq: ['$language', language] } },
                    {
                      $expr: {
                        $regexMatch: {
                          input: '$value',
                          regex: keyword,
                          options,
                        },
                      },
                    },
                  ],
                },
              },
            ],
            as: 'value',
          },
        },
        { $unwind: { path: '$value', preserveNullAndEmptyArrays: false } },
        { $addFields: { name: '$value.value' } },
        {
          $facet: {
            resultData: [{ $sort: { name: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(locations)
  } catch (err) {
    console.error(`[location.getLocations] ${strings.DB_ERROR} ${req.query.s}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function checkLocation(req: Request, res: Response) {
  const { id } = req.params

  try {
    const _id = new mongoose.Types.ObjectId(id)

    const count = await Property.find({ locations: _id }).limit(1).count()

    if (count === 1) {
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    console.error(`[location.checkLocation] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}
