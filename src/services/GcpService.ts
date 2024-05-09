import { PubSub } from '@google-cloud/pubsub'
import { IGcpConfig, IPerson } from '../models'
import { logger } from '../logging'
import { PersonRepository } from '../repository'

export class GcpService {
  pubSub: PubSub

  constructor (private gcpConfig: IGcpConfig, private personRepository: PersonRepository) {
    this.pubSub = new PubSub({ projectId: gcpConfig.projectId })
  }

  async emitMessage (message: any): Promise<boolean> {
    logger.info('Message DTO', { msg: message })

    const topic = await this.pubSub.topic(this.gcpConfig.topic)

    return topic.publishJSON(message)
      .then(messageId => {
        logger.info('Message published', { messageId })
        // todo:  remove
        this.createPerson({ firstName: 'mock' })
        return true
      })
      .catch(reason => {
        logger.error('Publishing message to topic threw an exception', { reason })
        return false
      })
  }

  async createPerson (person: IPerson): Promise<IPerson> {
    return this.personRepository.createPerson(person)
      .then(personData => {
        logger.info('Person created in store', { personData })
        return personData
      }).catch(reason => {
        logger.error('Create Person throw an exception', { reason })
        throw reason
      })
  }
}
