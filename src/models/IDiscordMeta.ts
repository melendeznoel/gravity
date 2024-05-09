import { IMeta } from './IMeta'

export interface IDiscordMeta extends IMeta {
  channelId: string
  authorId: string
  guildId: string
}
