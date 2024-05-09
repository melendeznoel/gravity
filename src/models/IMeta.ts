import { MessageTypeEnum } from '../enums'

export interface IMeta {
  timestamp: number
  source: string
  id: string
  type: MessageTypeEnum
  authorId: string
  channelId: string
  guildId: string
}
