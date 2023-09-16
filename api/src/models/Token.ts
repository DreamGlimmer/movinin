import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const tokenSchema = new Schema<env.Token>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
    },
    token: {
      type: String,
      required: [true, "can't be blank"],
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: env.TOKEN_EXPIRE_AT },
    },
  },
  {
    strict: true,
    collection: 'Token',
  },
)

const Token = model<env.Token>('Token', tokenSchema)

Token.on('index', (err) => {
  if (err) {
    console.error('Token index error: %s', err)
  } else {
    console.info('Token indexing complete')
  }
})

export default Token
