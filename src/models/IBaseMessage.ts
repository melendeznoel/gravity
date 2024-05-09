import { IMeta } from './IMeta'
import { IMessageData } from './IMessageData'

export interface IBaseMessage {
  data: IMessageData
  meta: IMeta
}
