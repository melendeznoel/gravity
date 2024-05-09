import { HolaService } from './bots'
import { DiscordService, GcpService } from './services'
import { DiscordSubscription, GcpSubscription } from './subscriptions'
import { IDiscordConfig, IGcpConfig } from './models'
import { logger } from './logging'
import { PersonRepository } from './repository'

const discordConfig: IDiscordConfig = {
  token: process.env.DISCORD_TOKEN || ''
}

const gcpConfig: IGcpConfig = {
  projectId: process.env.GCP_PROJECT_ID || '',
  topic: process.env.GCP_TOPIC_NAME || '',
  topicSubscription: process.env.GCP_TOPIC_SUBSCRIPTION_NAME || '',
  fhirStoreId: process.env.GCP_FHIR_STORE_ID || '',
  datasetId: process.env.GCP_DATASET_ID || '',
  region: process.env.GCP_REGION || '',
  runningLocally: process.env.RUNNING_LOCALLY || ''
}

logger.info('Environment Variables', { gcpConfig, discordConfig })

// service
const gcpService = new GcpService(gcpConfig, new PersonRepository(gcpConfig))
const discordService = new DiscordService()

// subscription
const discordSubscription = new DiscordSubscription(discordConfig, discordService, gcpService)
const gcpSubscription = new GcpSubscription(gcpConfig, gcpService, discordService)

const holaService = new HolaService(discordSubscription, gcpSubscription)

holaService.start()
  .then(value => {
    logger.info(`${ value ? 'Bot service started' : 'Bot service could not start' }`)
  })
  .catch(reason => {
    logger.error('Starting Service threw an exception', { reason })
    throw reason
  })
