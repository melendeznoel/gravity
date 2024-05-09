import { Serializer } from 'jsonapi-serializer'
import { MessageTypeEnum, MesssageStatusEnum } from '../enums'
import { IBaseMessage, IDiscordMessageRequest, IDiscordMeta, IMessageData, IMeta } from '../models'
import { Client, Message, MessageManager, TextChannel } from 'discord.js'
import { v4 as uuid } from 'uuid'
import { logger } from '../logging'
import { isEmpty } from 'lodash'

export class DiscordService {
  _discordClient: Client

  constructor () {
    this._discordClient = new Client()
  }

  findMessage (messageRequest: IDiscordMessageRequest): Promise<Message> {
    const messageManager = this._getMessageManager(messageRequest.discordClient, messageRequest.messageGuildId, messageRequest.messageChannelId)

    if (!messageManager) throw new Error('Cloud not connect to Message Manager')

    return messageManager.fetch(messageRequest.messageId)
  }

  buildMessageDto (message: Message) {
    const data: IMessageData = {
      status: MesssageStatusEnum.EVALUATE,
      text: message.content,
      meta: {} as IMeta,
      attributes: {}
    }

    const dataMeta: IDiscordMeta = {
      authorId: message.author.id,
      channelId: message.channel.id,
      guildId: message.guild?.id || '',
      timestamp: 0,
      source: '',
      id: message.id,
      type: MessageTypeEnum.NONE
    }

    const meta: IMeta = {
      id: uuid(),
      source: 'discord',
      timestamp: message.createdTimestamp,
      type: MessageTypeEnum.DiscordMessage,
      guildId: '',
      channelId: '',
      authorId: ''
    }

    return new Serializer(MessageTypeEnum.DiscordMessage, {
      attributes: Object.keys(data),
      dataMeta: dataMeta,
      meta: meta
    }).serialize(data)
  }

  isFromBot (message: Message): boolean {
    if (!message.author) return false

    return message.author.bot
  }

  _getMessageManager (discordClient: Client, guildId: string, channelId: string) {
    if (!discordClient || isEmpty(guildId) || isEmpty(channelId)) return null

    const guild = discordClient.guilds.cache.get(guildId)

    if (!guild) return null

    const textChannel = new TextChannel(guild, { type: 'text', id: channelId })

    return new MessageManager(textChannel)
  }

  async updateMessage (message: IBaseMessage): Promise<string> {
    logger.info('GCP Message from Topic', { msg: message })

    if (!this._canReplyToMessage(message)) {
      logger.warn('Did not reply to Discord message', { data: message })
      return ''
    }

    const request = this._buildDiscordMessageRequest(message)

    const discordMessage = await this.findMessage(request)

    if (!discordMessage) {
      logger.error('The message could not be found', { data: message })
      throw new Error('The message could not be found')
    }

    const result = await discordMessage.reply(message.data.attributes.outcome)
      .then(value => {
        logger.info('Replied to discord message')
        return value
      }).catch(reason => {
        logger.error('Reply to discord message threw an exception', { reason })
        throw reason
      })

    return result.id
  }

  _buildDiscordMessageRequest (message: IBaseMessage): IDiscordMessageRequest {
    const { id, channelId, guildId } = message.data.meta

    return {
      discordClient: this._discordClient,
      messageId: id,
      messageChannelId: channelId,
      messageGuildId: guildId
    }
  }

  _canReplyToMessage (message: IBaseMessage): boolean {
    const data = message?.data?.attributes?.outcome

    return data !== undefined && data !== ''
  }
}
