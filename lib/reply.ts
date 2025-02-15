import config from '../config'
import { sample } from 'midash'
import wretch from 'wretch'
import { retry } from 'wretch/middlewares/retry'
import { retry as pRetry } from '@shanyue/promise-utils'
import * as Sentry from '@sentry/node'
import { logger } from './logger'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type GPTModel =
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0301'

export async function reply(messages: ChatMessage[]) {
  const apiKey = sample(config.apiKey)

  // TODO: wretch retry 中间件无法返回 40x 异常，需修复
  const w = wretch(config.baseURL).middlewares([
    // retry({
    //   delayTimer: 500,
    //   maxAttempts: 3,
    //   until (response, error) {
    //     return response && response.ok
    //   }
    // })
  ])
  const getReply = () => w
    .url('/v1/chat/completions')
    .headers({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
    .post({
      model: config.model,
      messages
    })
    .json((data) => {
      if (!data.choices.length) {
        throw new Error('No Content')
      }
      return data.choices[0].message.content
    })
  return pRetry(getReply, { times: 5 })
    .catch((e) => {
      logger.error(e)
      Sentry.captureException(e)
      return '抱歉，我发生了一点小意外。'
    })
}
