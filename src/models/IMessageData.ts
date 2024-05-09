import { MesssageStatusEnum } from '../enums'
import { IMeta } from './IMeta'

export interface IMessageData {
  status?: MesssageStatusEnum
  text?: string
  meta: IMeta
  attributes: any
}
