import { DiscordService, GcpService } from '../services'
import { Constants, Message } from 'discord.js'
import { IDiscordConfig } from '../models'
import { logger } from '../logging'

export class DiscordSubscription {
  constructor (private discordConfig: IDiscordConfig, private discordService: DiscordService, private gcpService: GcpService) {
  }

  async start (): Promise<boolean> {
    this.discordService._discordClient.on(Constants.Events.CLIENT_READY, this._onReady.bind(this))
    this.discordService._discordClient.on(Constants.Events.MESSAGE_CREATE, this._onMessageCreate.bind(this))

    return this.discordService._discordClient.login(this.discordConfig.token)
      .then(() => true)
      .catch(reason => {
        logger.error('Login to discord threw an exception', { reason })
        throw reason
      })
  }

  _onReady () {
    logger.info('discord subscription created!')
  }

  _onMessageCreate (message: Message) {
    if (this.discordService.isFromBot(message)) return

    logger.info('Message from discord', { discordMessage: message })

    return this.gcpService.emitMessage(this.discordService.buildMessageDto(message))
  }
}
