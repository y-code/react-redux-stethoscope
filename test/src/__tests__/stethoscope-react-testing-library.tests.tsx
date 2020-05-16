import React from 'react'
import configureStore from '../store/configureStore'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import App from '../App'
import configureFetch from '../store/configureFetch'
import { actionCreators as inboxActionCreators } from '../store/inbox'
import { actionCreators as pollingActionCreators, thunkCreators as pollingThunkCreators } from '../store/polling'
import { Stethoscope } from 'react-redux-stethoscope'
import { AppState } from '../store'
import fetch from 'fetch-mock'
import { getLogger } from 'log4js'

describe('React-Redux Stethoscope with React Testing Library', () => {

  const logger = getLogger('React-Redux Stethoscope Tests')

  beforeEach(() => {
    fetchMock.doMock
    configureFetch()
  })

  afterEach(() => {
    fetch.restore()
    fetchMock.dontMock()
  })

  it('calls back when all the connected React components finished re-render for the first action. [React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.getAllByText(/↺/)[0].click()
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            expect(wrapper.queryAllByTestId("message.loading")).toHaveLength(1)
          }
        },
      ]
    }
      
    )
  })

  it('calls back when all the connected React components finished re-render for the second action. [React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.getAllByText(/↺/)[0].click()
      },
      targets: [
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            const messages = wrapper.queryAllByTestId('message.subject')
            expect(messages).toHaveLength(2)
            expect(messages[0].textContent).toBe('Hello, World')
            expect(messages[1].textContent).toBe('Yo, World')
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for each action. [React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.getAllByText(/↺/)[0].click()
      },
      targets: [
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            const messages = wrapper.queryAllByTestId('message.subject')
            expect(messages).toHaveLength(2)
            expect(messages[0].textContent).toBe('Hello, World')
            expect(messages[1].textContent).toBe('Yo, World')
          }
        },
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            expect(wrapper.queryAllByTestId("message.loading")).toHaveLength(1)
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for each action, even when there\'s parallel async dispatch calls. [with React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [stethoscope.asMiddleware()])

    const wrapper = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        logger.info("=== OPERATION 1 ===")
        store.dispatch(pollingThunkCreators.requestPolling() as any)
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            logger.info("--- SECOND VERIFICATION ---")
            expect(wrapper.queryAllByTestId("message.loading")).toHaveLength(1)
            expect(wrapper.queryAllByTestId('message.subject')).toHaveLength(0)
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            logger.info("--- THIRD VERIFICATION ---")
            expect(wrapper.queryByTestId('message.loading')).toBeNull()
            const messages = wrapper.queryAllByTestId('message.subject')
            expect(messages).toHaveLength(2)
            expect(messages[0].textContent).toBe('Hello, World')
            expect(messages[1].textContent).toBe('Yo, World')
          }
        },
        {
          actionType: pollingActionCreators.requestInboxPolling().type,
          onUpdated: () => {
            logger.info("--- FIRST VERIFICATION ---")
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeUndefined()
            expect(wrapper.queryByTestId('message.loading')).toBeNull()
            expect(wrapper.queryAllByTestId('message.subject')).toHaveLength(0)
          }
        },
        {
          actionType: pollingActionCreators.receiveInboxPolling({} as any).type,
          onUpdated: () => {
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeDefined()
            expect(state.polling.inbox?.messages).toBeTruthy()
          }
        },
        {
          actionType: pollingActionCreators.resetInboxPolling().type,
          onUpdated: () => {
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeDefined()
            expect(state.polling.inbox?.messages).toBeFalsy()
          }
        },
      ]
    })

    for (let i = 0; i < 4; i++) {
      await stethoscope.listenAsync({
        act: () => {
          logger.info(`=== OPERATION ${i + 2} ===`)
          store.dispatch(pollingThunkCreators.requestPolling() as any)
        },
        targets: [
          {
            actionType: pollingActionCreators.requestInboxPolling().type,
            onUpdated: () => {
              logger.info("--- FIRST VERIFICATION ---")
              let state = store.getState() as AppState;
              expect(state.polling.inbox).toBeUndefined()
              expect(wrapper.queryByTestId('message.loading')).toBeNull()
              expect(wrapper.queryAllByTestId('message.subject')).toHaveLength(2)
            }
          },
          {
            actionType: pollingActionCreators.receiveInboxPolling({} as any).type,
            onUpdated: () => {
              let state = store.getState() as AppState;
              expect(state.polling.inbox).toBeDefined()
              expect(state.polling.inbox?.messages).toBeFalsy()
            }
          },
          {
            actionType: pollingActionCreators.resetInboxPolling().type,
            onUpdated: () => {
              let state = store.getState() as AppState;
              expect(state.polling.inbox).toBeDefined()
              expect(state.polling.inbox?.messages).toBeFalsy()
            }
          },
        ]
      })
    }

    await stethoscope.listenAsync({
      act: () => {
        logger.info("=== OPERATION 6 ===")
        store.dispatch(pollingThunkCreators.requestPolling() as any)
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            logger.info("--- SECOND VERIFICATION ---")
            expect(wrapper.queryAllByTestId("message.loading")).toHaveLength(1)
            expect(wrapper.queryAllByTestId('message.subject')).toHaveLength(0)
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            logger.info("--- THIRD VERIFICATION ---")
            expect(wrapper.queryByTestId('message.loading')).toBeNull()
            const messages = wrapper.queryAllByTestId('message.subject')
            expect(messages).toHaveLength(3)
            expect(messages[0].textContent).toBe('Hello, World')
            expect(messages[1].textContent).toBe('Yo, World')
            expect(messages[2].textContent).toBe('こんにちは')
          }
        },
        {
          actionType: pollingActionCreators.requestInboxPolling().type,
          onUpdated: () => {
            logger.info("--- FIRST VERIFICATION ---")
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeUndefined()
            expect(wrapper.queryByTestId('message.loading')).toBeNull()
            let messages = wrapper.queryAllByTestId('message.subject')
            expect(messages).toHaveLength(2)
            expect(messages[0].textContent).toBe('Hello, World')
            expect(messages[1].textContent).toBe('Yo, World')
          }
        },
        {
          actionType: pollingActionCreators.receiveInboxPolling({} as any).type,
          onUpdated: () => {
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeDefined()
            expect(state.polling.inbox?.messages).toBeTruthy()
          }
        },
        {
          actionType: pollingActionCreators.resetInboxPolling().type,
          onUpdated: () => {
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeDefined()
            expect(state.polling.inbox?.messages).toBeFalsy()
          }
        },
      ]
    })
  })
})
