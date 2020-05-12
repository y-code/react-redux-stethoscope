import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import * as inbox from './inbox'
import * as polling from './polling'

export interface AppState {
  polling: polling.State,
  inbox: inbox.State,
}

export declare type AppThunkAction<E = {}> = ThunkAction<void, AppState, E, AnyAction>

export const thunkCreators = {
  polling: polling.thunkCreators,
  inbox: inbox.thunkCreators,
}

export type PollingState = polling.State
export type InboxState = inbox.State
export type Message = inbox.Message
