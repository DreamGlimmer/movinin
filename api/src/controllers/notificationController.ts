import mongoose from 'mongoose'
import { Request, Response } from 'express'
import strings from '../config/app.config'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'

export async function notificationCounter(req: Request, res: Response) {
  const { userId } = req.params
  try {
    const counter = await NotificationCounter.findOne({ user: userId })

    if (counter) {
      return res.json(counter)
    } else {
      const cnt = new NotificationCounter({ user: userId })
      await cnt.save()
      return res.json(cnt)
    }
  } catch (err) {
    console.error(`[notification.notificationCounter] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function getNotifications(req: Request, res: Response) {
  const { userId: _userId, page: _page, size: _size } = req.params

  try {
    const userId = new mongoose.Types.ObjectId(_userId)
    const page = Number.parseInt(_page)
    const size = Number.parseInt(_size)

    const notifications = await Notification.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          resultData: [{ $sort: { createdAt: -1 } }, { $skip: (page - 1) * size }, { $limit: size }],
          pageInfo: [
            {
              $count: 'totalRecords',
            },
          ],
        },
      },
    ])

    return res.json(notifications)
  } catch (err) {
    console.error(`[notification.getNotifications] ${strings.DB_ERROR} ${_userId}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const _ids: string[] = req.body.ids
    const ids = _ids.map((id) => new mongoose.Types.ObjectId(id))
    const { userId: _userId } = req.params
    const userId = new mongoose.Types.ObjectId(_userId)

    const bulk = Notification.collection.initializeOrderedBulkOp()
    const notifications = await Notification.find({
      _id: { $in: ids },
      isRead: false,
    })
    const length = notifications.length

    bulk.find({ _id: { $in: ids }, isRead: false }).update({ $set: { isRead: true } })
    const result = await bulk.execute()

    if (result.modifiedCount !== length) {
      console.error(`[notification.markAsRead] ${strings.DB_ERROR}`)
      return res.status(400).send(strings.DB_ERROR)
    }
    const counter = await NotificationCounter.findOne({ user: userId })
    if (!counter) {
      return res.sendStatus(204)
    }
    counter.count! -= length
    await counter.save()

    return res.sendStatus(200)
  } catch (err) {
    console.error(`[notification.markAsRead] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function markAsUnRead(req: Request, res: Response) {
  try {
    const _ids: string[] = req.body.ids
    const ids = _ids.map((id) => new mongoose.Types.ObjectId(id))
    const { userId: _userId } = req.params
    const userId = new mongoose.Types.ObjectId(_userId)

    const bulk = Notification.collection.initializeOrderedBulkOp()
    const notifications = await Notification.find({
      _id: { $in: ids },
      isRead: true,
    })
    const length = notifications.length

    bulk.find({ _id: { $in: ids }, isRead: true }).update({ $set: { isRead: false } })
    const result = await bulk.execute()

    if (result.modifiedCount !== length) {
      console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`)
      return res.status(400).send(strings.DB_ERROR)
    }
    const counter = await NotificationCounter.findOne({ user: userId })
    if (!counter) {
      return res.sendStatus(204)
    }
    counter.count! += length
    await counter.save()

    return res.sendStatus(200)
  } catch (err) {
    console.error(`[notification.markAsUnRead] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function deleteNotifications(req: Request, res: Response) {
  try {
    const _ids: string[] = req.body.ids
    const ids = _ids.map((id) => new mongoose.Types.ObjectId(id))
    const { userId: _userId } = req.params
    const userId = new mongoose.Types.ObjectId(_userId)

    const count = await Notification.find({ _id: { $in: ids }, isRead: false }).count()
    await Notification.deleteMany({ _id: { $in: ids } })

    const counter = await NotificationCounter.findOne({ user: userId })
    if (!counter) {
      return res.sendStatus(204)
    }
    counter.count! -= count
    await counter.save()

    return res.sendStatus(200)
  } catch (err) {
    console.error(`[notification.deleteNotifications] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}
