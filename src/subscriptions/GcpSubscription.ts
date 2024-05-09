import { DiscordService, GcpService } from '../services'
import { IGcpConfig } from '../models'
import { PubSub, Message } from '@google-cloud/pubsub'
import { MessageTypeEnum, MesssageStatusEnum } from '../enums'
import { logger } from '../logging'

export class GcpSubscription {
  _pubSub: PubSub

  constructor (private gcpConfig: IGcpConfig, private gcpService: GcpService, private discordService: DiscordService) {
    this._pubSub = new PubSub({ projectId: gcpConfig.projectId })
  }

  async start (): Promise<boolean> {
    const topic = this._pubSub.topic(this.gcpConfig.topic)
    const subscription = topic.subscription(this.gcpConfig.topicSubscription)

    subscription.on('message', this._handleMessages.bind(this))
    subscription.on('error', this._handleError.bind(this))

    logger.info('Connected to GCP Subscription', { data: this.gcpConfig.topicSubscription })

    return true
  }

  async _handleMessages (message: Message) {
    message.ack()

    if (!message.data) {
      return false
    }

    const messageJson = JSON.parse(message.data.toString())

    logger.info('Arriving Message', { msg: messageJson })

    if (!this._canActOnMessage(messageJson)) {
      if (this._isDiscordMessage(messageJson)) {
        logger.warn('No Action on Discord Message is taken')
      } else {
        logger.warn('No Action on Message is taken')
      }

      return false
    }

    await this.discordService.updateMessage(messageJson)
      .then(value => {
        logger.info(`${ value === '' ? 'Discord Message not updated' : 'Updated Discord Message' }`, { data: messageJson })
      })
      .catch(reason => {
        logger.error('Updating Discord message threw an exception', { reason })
        throw reason
      })

    return true
  }

  _handleError (error: any) {
    logger.error('Subscription threw an exception', error)
    throw new Error('Subscription threw an exception!')
  }

  _canActOnMessage (message: any): boolean {
    if (!message) return false
    if (!message.meta || !message.data) return false
    if (!this._isDiscordMessage(message)) return false
    if (!message?.data?.attributes) return false

    return message.data.attributes.status === MesssageStatusEnum.EVALUATED
  }

  _isDiscordMessage (message: any): boolean {
    return message?.meta?.type === MessageTypeEnum.DiscordMessage
  }
}
