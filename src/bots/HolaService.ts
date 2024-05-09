import { DiscordSubscription, GcpSubscription } from '../subscriptions'

export class HolaService {
  constructor (private discordSubscription: DiscordSubscription, private gcpSubscription: GcpSubscription) {
  }

  async start (): Promise<boolean> {
    return Promise.all([ this.discordSubscription.start(), this.gcpSubscription.start() ])
      .then(values => !values.includes(false))
  }
}
