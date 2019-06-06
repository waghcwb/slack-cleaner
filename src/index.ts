import consola from 'consola'
import { ArgumentsBuilder, RequestBuilder } from './builders'

// load .env variables
require('dotenv').config()

/**
 * SlackCleaner class
 * - This class can delete all messages from user or channel on Slack.
 */
export class SlackCleaner {
  private token: string // token to make requests to slack api
  private channel: string // the channel id for searching messages
  private readonly user: string // the user id
  private delay: number // delay for between each request
  private nextCursor: string // the next page to be fetched
  private index: number // keep track of what chunk we're getting

  constructor() {
    consola.info({
      badge: true,
      message: 'Starting slack channel cleaner.',
    })

    try {
      const options = this.getParameters()

      const { token, channel, user, delay } = options

      this.token = token
      this.channel = channel
      this.user = user
      this.delay = delay
      this.init()
    } catch (err) {
      consola.fatal({
        badge: true,
        message: err.message,
      })
    }
  }

  /**
   * Call messages handler
   */
  init() {
    this.handleMessages()
  }

  /**
   * Manage parameters
   * - This method can get parameters from cli as arguments or from a .env file
   */
  private getParameters() {
    let options: any = {}
    const requestDelayDefaultValue = 400

    consola.debug({
      badge: true,
      message: 'Getting parameters.',
    })

    try {
      // try to get options from arguments
      const args = new ArgumentsBuilder()
        .withVersion('1.0.0')
        .withOption({
          alias: 't',
          command: 'token',
          description: 'Slack token.',
          required: true,
        })
        .withOption({
          alias: 'c',
          command: 'channel',
          description: 'Slack channel ID.',
          required: true,
        })
        .withOption({
          alias: 'd',
          command: 'delay',
          description: 'Delay for the requests.',
          defaultValue: requestDelayDefaultValue,
        })
        .withOption({
          alias: 'u',
          command: 'user',
          description: 'Delete messages for this username',
          required: true,
        })
        .parse(process.argv)

      options = args.getOpts()
    } catch (err) {
      const {
        SLACK_CHANNEL,
        SLACK_USER,
        SLACK_TOKEN,
        SLACK_REQUEST_DELAY = requestDelayDefaultValue,
      } = process.env

      if (
        err.message.startsWith('Missing required parameter:') &&
        (SLACK_CHANNEL && SLACK_USER && SLACK_TOKEN)
      ) {
        // try to get options from .env file
        options.channel = SLACK_CHANNEL
        options.user = SLACK_USER
        options.token = SLACK_TOKEN
        options.delay = SLACK_REQUEST_DELAY
      } else {
        throw err
      }
    }

    return options
  }

  /**
   * Handler for deleting a chunk of messages
   */
  async handleMessages() {
    this.index = this.index ? this.index + 1 : 1 // increment index

    consola.info(`Getting chunk number: ${this.index}`)

    try {
      const history: any = await this.getHistory() // get messages from history slack api

      if (history && history.ok) {
        if (history.messages && history.messages.length) {
          const userMessages = this.findUserMessages(history.messages)

          if (userMessages.length) {
            consola.info('Found user messages.')

            this.deleteMessageList(userMessages)
              .then(async () => {
                consola.info('Message chunk deleted.')

                if (history.has_more) {
                  this.nextCursor = history.response_metadata.next_cursor
                  this.handleMessages()
                } else {
                  consola.info('Loop finished.')
                  this.nextCursor = null
                }
              })
              .catch(err => {
                throw err
              })
          } else {
            consola.info('Not found user messages in this chunk.')

            if (history.has_more) {
              this.nextCursor = history.response_metadata.next_cursor
              this.handleMessages()
            } else {
              consola.info('Loop finished.')
              this.nextCursor = null
            }
          }
        } else {
          consola.info('Loop finished.')
          this.nextCursor = null
        }
      } else {
        throw new Error('Cannot get history.')
      }
    } catch (err) {
      consola.error(err.message)
    }
  }

  async getHistory(): Promise<object> {
    const { token, channel, nextCursor } = this

    try {
      const req = await new RequestBuilder()
        .withUrl('conversations.history')
        .withParams({
          token,
          channel,
          nextCursor,
          count: 1000,
        })
        .doRequest()
      return req.data
    } catch (err) {
      consola.error({
        badge: true,
        message: 'Error while getting conversations.',
      })
      consola.error(err.message)
    }
  }

  async deleteMessageList(messages: Array<object>) {
    return Promise.all(
      messages.map((message: any, index: number) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            this.deleteMessage(message.ts)
              .then(response => {
                consola.info('Message deleted.')
                consola.info(message.text)
                resolve(response)
              })
              .catch(err => {
                consola.error('Error deleting message.')
                consola.error(message.text)
                reject(err)
              })
          }, this.delay * index)
        })
      })
    )
  }

  async deleteMessage(ts: string) {
    const { token, channel } = this

    const { data } = await new RequestBuilder()
      .withUrl('chat.delete')
      .withParams({
        token,
        channel,
        ts,
      })
      .doRequest()

    if (data.ok) {
      return data
    } else if (data.error === 'ratelimited') {
      this.delay = this.delay + 100
      consola.warn({
        badge: true,
        message: `Increasing delay to: ${this.delay}`,
      })
    } else {
      throw new Error('[!] Error while deleting message.')
    }
  }

  findUserMessages(messages: Array<any>): Array<any> {
    return messages.filter((message: any) => message.user === this.user)
  }
}

if (require.main === module) {
  new SlackCleaner()
}
