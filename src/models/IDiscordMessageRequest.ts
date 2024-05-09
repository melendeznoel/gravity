import { Client } from 'discord.js'

export interface IDiscordMessageRequest {
  discordClient: Client
  messageGuildId: string
  messageChannelId: string
  messageId: string
}
