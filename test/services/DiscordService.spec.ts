import { strictEqual } from 'assert'
import { DiscordService } from '../../src/services'
import { Message } from 'discord.js'

describe.only('discord Service', () => {
  it('should set attributes', () => {
    const timestamp = parseInt(Date.now().toString(), undefined)

    const service = new DiscordService()

    const result = service.buildMessageDto({
      id: 'mockid',
      content: 'mockcontent',
      createdTimestamp: timestamp
    } as Message)

    strictEqual(result.meta.timestamp, timestamp)
  })
})
