import { ok } from 'assert'
import { toCamel } from '../src/variableMutators'

describe('A suite is just a function', () => {
  it('and so is a spec', () => {
    const a = true
    const temp = toCamel('{ "Opened_Email__c": false, "LastModifiedDate": "2019-06-19T14:15:36.000+0000", "Opened_Email__c": false }')
    ok(a)
  })
})
