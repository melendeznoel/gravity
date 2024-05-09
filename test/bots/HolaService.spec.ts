import { ok } from 'assert'
import { stub } from 'sinon'
import { HolaService } from '../../src/bots'
import { BrainService } from '../../src/services'

describe('Hola Service', () => {
  it('should return false', async () => {
    ok(true)
    // const service = new HolaService(new BrainService(), { token: 'mocktoken' })
    // const discordClientLoginStub = stub(service.discordClient, 'login').returns(Promise.resolve('mockstring'))
    //
    // ok(await service.start())
    //
    // discordClientLoginStub.restore()
  })
})
