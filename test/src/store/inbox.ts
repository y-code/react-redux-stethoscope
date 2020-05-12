import * as reduxActions from 'redux-actions'
import { AppThunkAction } from '.'

export interface State {
  selectedIds: number[]
  messages: {
    loading: boolean
    data: Message[]
    error: string|null
  }
}

export interface Message {
  id: number
  from: string
  to: string
  subject: string
  content: string
}

const AT_REQUEST_MESSAGES = '[inbox] request messages'
const AT_RECEIVE_MESSAGES = '[inbox] receive messages'
const AT_RECEIVE_ERROR_FOR_MESSAGES_REQUEST = '[inbox] receive error for messages request'
const AT_SELECT_MESSAGE = '[inbox] select a message'
const AT_SELECT_SINGLE_MESSAGE = '[inbox] select a single message and deselect all the others'
const AT_SELECT_ALL_MESSAGES = '[inbox] select all messages'
const AT_DESELECT_MESSAGE = '[inbox] deselect a message'
const AT_DESELECT_ALL_MESSAGES = '[inbox] deselect all messages'

export const actionCreators = {
  requestMessages: reduxActions.createAction(AT_REQUEST_MESSAGES),
  receiveMessages: reduxActions.createAction(AT_RECEIVE_MESSAGES, (json: any) => json.messages as Message[]),
  receiveErrorForMessagesRequest: reduxActions.createAction(AT_RECEIVE_ERROR_FOR_MESSAGES_REQUEST, (err: any) => err),
  selectMessage: reduxActions.createAction(AT_SELECT_MESSAGE, (message: Message) => message.id),
  selectAllMessages: reduxActions.createAction(AT_SELECT_ALL_MESSAGES),
  selectSingleMessage: reduxActions.createAction(AT_SELECT_SINGLE_MESSAGE, (message: Message) => message.id),
  deselectMessage: reduxActions.createAction(AT_DESELECT_MESSAGE, (message: Message) => message.id),
  deselectAllMessages: reduxActions.createAction(AT_DESELECT_ALL_MESSAGES),
}

export const thunkCreators = {
  requestMessages: (): AppThunkAction => (dispatch, getState) => {
    let state = getState();
    if (state.inbox.messages.loading)
      return Promise.resolve();

    dispatch(actionCreators.requestMessages())

    return fetch('/api/inbox/messages', { method: 'GET' })
      .then(
        response => response.json(),
        err => {
          console.error(`received error after requesting messages: ${err}`)
          return dispatch(actionCreators.receiveErrorForMessagesRequest(err))
        }
      )
      .then(json => {
        return dispatch(actionCreators.receiveMessages(json))
      })
  },
  selectMessage: (message: Message): AppThunkAction => (dispatch, getState) =>
    dispatch(actionCreators.selectMessage(message)),
  selectAllMessages: (): AppThunkAction => (dispatch, getState) =>
    dispatch(actionCreators.selectAllMessages()),
  selectSingleMessage: (message: Message): AppThunkAction => (dispatch, getState) =>
    dispatch(actionCreators.selectSingleMessage(message)),
  deselectMessage: (message: Message): AppThunkAction => (dispatch, getState) =>
    dispatch(actionCreators.deselectMessage(message)),
  deselectAllMessages: (): AppThunkAction => (dispatch, getState) =>
    dispatch(actionCreators.deselectAllMessages()),
}

const initialState: State = {
  selectedIds: [],
  messages: {
    loading: false,
    data: [],
    error: null,
  }
}

export const reducerMap: reduxActions.ReducerMap<State, Message[] & any> = {}
reducerMap[AT_REQUEST_MESSAGES] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    messages: {
      loading: true,
      data: [],
      error: null,
    }
  }
}
reducerMap[AT_RECEIVE_MESSAGES] = (state, action: reduxActions.Action<Message[]>) => {
  const newIds = action.payload.map(m => m.id)
  return {
    ...state,
    selectedIds: state.selectedIds.filter(id => newIds.includes(id)),
    messages: {
      loading: false,
      data: action.payload,
      error: null,
    }
  }
}
reducerMap[AT_RECEIVE_ERROR_FOR_MESSAGES_REQUEST] = (state, action: reduxActions.Action<any>) => {
  return {
    ...state,
    selectedIds: [],
    messages: {
      loading: false,
      data: [],
      error: action.payload.message ? action.payload.message : 'received unknown error',
    }
  }
}
reducerMap[AT_SELECT_MESSAGE] = (state, action: reduxActions.Action<number>) => {
  return {
    ...state,
    selectedIds: [ ...state.selectedIds, action.payload ],
  }
}
reducerMap[AT_SELECT_ALL_MESSAGES] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    selectedIds: state.messages.data.map(m => m.id),
  }
}
reducerMap[AT_SELECT_SINGLE_MESSAGE] = (state, action: reduxActions.Action<number>) => {
  return {
    ...state,
    selectedIds: [ action.payload ],
  }
}
reducerMap[AT_DESELECT_MESSAGE] = (state, action: reduxActions.Action<number>) => {
  return {
    ...state,
    selectedIds: state.selectedIds.filter(id => id !== action.payload),
  }
}
reducerMap[AT_DESELECT_ALL_MESSAGES] = (state, action: reduxActions.Action<{}>) => {
  return {
    ...state,
    selectedIds: [],
  }
}

export const reducer = reduxActions.handleActions(
  reducerMap,
  initialState
)
