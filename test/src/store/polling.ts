import * as reduxActions from 'redux-actions'
import { AppThunkAction, thunkCreators as appThunkCreators } from '.'
import { AnyAction } from 'redux'

export interface State {
  inbox: InboxPolling|undefined
}

export interface InboxPolling {
  messages: boolean|undefined
}

const AT_REQUEST_INBOX_POLLING = '[polling] request inbox polling'
const AT_RECEIVE_INBOX_POLLING = '[polling] receive inbox polling'
const AT_RESET_INBOX_POLLING = '[polling] reset inbox polling state'
const AT_RECEIVE_ERROR_FOR_INBOX_POLLING_REQUEST = '[polling] receive error for inbox polling request'

export const actionCreators = {
  requestInboxPolling: reduxActions.createAction(AT_REQUEST_INBOX_POLLING),
  receiveInboxPolling: reduxActions.createAction(AT_RECEIVE_INBOX_POLLING, (json: InboxPolling) => json),
  resetInboxPolling: reduxActions.createAction(AT_RESET_INBOX_POLLING),
  receiveErrorForInboxPollingRequest: reduxActions.createAction(AT_RECEIVE_ERROR_FOR_INBOX_POLLING_REQUEST, (err: any) => err),
}

export const thunkCreators = {
  requestPolling: (): AppThunkAction => (dispatch, getState) => {
    let state = getState()

    if (state.polling.inbox === undefined /* requesting polling */ || state.polling.inbox.messages === true /* requesting imbox messages */) {
      return
    }

    dispatch(actionCreators.requestInboxPolling())

    return fetch('/api/inbox/polling', { method: 'GET' })
      .then(
        response => response.json(),
        err => {
          console.error(`received error after requesting inbox polling: ${err}`)
          return dispatch(actionCreators.receiveErrorForInboxPollingRequest(err))
        }
      )
      .then(json => {
        if ((json as InboxPolling).messages) {
          dispatch(actionCreators.receiveInboxPolling(json))
          return ((dispatch(appThunkCreators.inbox.requestMessages()) as any) as Promise<AnyAction>)
            .then(() => dispatch(actionCreators.resetInboxPolling()))
        } else {
          dispatch(actionCreators.receiveInboxPolling(json))
          return dispatch(actionCreators.resetInboxPolling())
        }
      })
  },
}

const initialState: State = {
  inbox: {
    messages: false,
  },
}

export const reducerMap: reduxActions.ReducerMap<State, InboxPolling & any> = {}

reducerMap[AT_REQUEST_INBOX_POLLING] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    inbox: undefined,
  }
}
reducerMap[AT_RECEIVE_INBOX_POLLING] = (state, action: reduxActions.Action<InboxPolling>) => {
  return {
    ...state,
    inbox: action.payload,
  }
}
reducerMap[AT_RECEIVE_ERROR_FOR_INBOX_POLLING_REQUEST] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    inbox: {
      messages: undefined,
    },
  }
}
reducerMap[AT_RESET_INBOX_POLLING] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    inbox: {
      messages: false,
    },
  }
}


export const reducer = reduxActions.handleActions(
  reducerMap,
  initialState
)
