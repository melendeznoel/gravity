import { google } from 'googleapis'
import { logger } from '../logging'
import { IGcpConfig, IPerson } from '../models'
import { exec } from 'child_process'

const healthcare = google.healthcare('v1')

export class PersonRepository {
  constructor (private gcpConfig: IGcpConfig) {

  }

  public async createPerson (person: IPerson): Promise<IPerson> {
    const data = {
      'name': [ { 'use': 'official', 'family': 'Smith', 'given': [ 'Darcy' ] } ],
      'gender': 'female',
      'birthDate': '1970-01-01',
      'resourceType': 'Person'
    }

    if (this.gcpConfig.runningLocally === 'true') {
      google.options({
        headers: {
          'Authorization': await this._getBearerToken(),
          'Content-Type': 'application/fhir+json'
        }
      })
    } else {
      google.options({
        auth: await this._getGcpAuthClient(),
        headers: { 'Content-Type': 'application/fhir+json' }
      })
    }

    const parent = `projects/${ this.gcpConfig.projectId }/locations/${ this.gcpConfig.region }/datasets/${ this.gcpConfig.datasetId }/fhirStores/${ this.gcpConfig.fhirStoreId }`

    return healthcare.projects.locations.datasets.fhirStores.fhir.create({
      parent: parent,
      type: 'Person',
      requestBody: data
    } as any).then(response => {
      return response.data as IPerson
    }).catch(reason => {
      logger.error('FHIR Create throw an exception', { reason })
      throw reason
    })
  }

  _getGcpAuthClient (): Promise<any> {
    const auth = new google.auth.GoogleAuth({
      scopes: [ 'https://www.googleapis.com/auth/compute' ]
    })

    return auth.getClient()
      .then(response => {
        if (response) {
          logger.info('Gcp Client Response', { response })
        }

        return response
      })
  }

  _getBearerToken (): Promise<string> {
    return new Promise<string>(resolve => {
      exec('gcloud auth print-access-token', (error, stdout) => {
        if (error) resolve('')
        const bearerToken = stdout ? `Bearer ${ stdout.trim() }` : ''
        resolve(bearerToken)
      })
    })
  }
}
