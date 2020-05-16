import React from 'react'
import configureStore from '../store/configureStore'
import { Provider } from 'react-redux'
import App from '../App'
import configureFetch from '../store/configureFetch'
import { actionCreators as inboxActionCreators } from '../store/inbox'
import { actionCreators as pollingActionCreators, thunkCreators as pollingThunkCreators } from '../store/polling'
import { Stethoscope } from 'react-redux-stethoscope'
import { mount } from 'enzyme'
import { AppState } from '../store'
import fetch from 'fetch-mock'
import { getLogger } from 'log4js'

describe('React-Redux Stethoscope with Enzyme', () => {

  const logger = getLogger('React-Redux Stethoscope Tests')

  beforeEach(() => {
    fetchMock.doMock
    configureFetch()
  })

  afterEach(() => {
    fetch.restore()
    fetchMock.dontMock()
  })

  it('calls back when all the connected React components finished re-render for the first action. [Enzyme]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.find('button[data-testid="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            wrapper.update()
            expect(wrapper.find('div[data-testid="message.loading"]')).toHaveLength(1)
            expect(wrapper.exists('div[data-testid="message.subject"]')).toBeFalsy()
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for the second action. [Enzyme]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.find('button[data-testid="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            wrapper.update()
            const messages = wrapper.find('div[data-testid="message.subject"]')
            expect(messages).toHaveLength(2)
            expect(messages.at(0).text()).toEqual('Hello, World')
            expect(messages.at(1).text()).toEqual('Yo, World')
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for each action. [Enzyme]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        wrapper.find('button[data-testid="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            wrapper.update()
            expect(wrapper.exists('div[data-testid="message.subject"]')).toBeFalsy()
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            wrapper.update()
            const messages = wrapper.find('div[data-testid="message.subject"]')
            expect(messages).toHaveLength(2);
            expect(messages.at(0).text()).toEqual('Hello, World')
            expect(messages.at(1).text()).toEqual('Yo, World')
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for each action, even when there\'s parallel async dispatch calls. [with React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = mount(
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
            wrapper.update()
            expect(wrapper.find('div[data-testid="message.loading"]')).toHaveLength(1)
            expect(wrapper.exists('div[data-testid="message.subject"]')).toBeFalsy()
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            logger.info("--- THIRD VERIFICATION ---")
            wrapper.update()
            expect(wrapper.exists('div[data-testid="message.loading"]')).toBeFalsy()
            let messages = wrapper.find('div[data-testid="message.subject"]')
            expect(messages).toHaveLength(2)
            expect(messages.at(0).text()).toBe('Hello, World')
            expect(messages.at(1).text()).toBe('Yo, World')
          }
        },
        {
          actionType: pollingActionCreators.requestInboxPolling().type,
          onUpdated: () => {
            logger.info("--- FIRST VERIFICATION ---")
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeUndefined()
            wrapper.update()
            expect(wrapper.exists('div[data-testid="message.loading"]')).toBeFalsy()
            expect(wrapper.exists('div[data-testid="message.subject"]')).toBeFalsy()
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
              wrapper.update()
              expect(wrapper.exists('div[data-testid="message.loading"]')).toBeFalsy()
              var messages = wrapper.find('div[data-testid="message.subject"]')
              expect(messages).toHaveLength(2)
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
            wrapper.update()
            expect(wrapper.find('div[data-testid="message.loading"]')).toHaveLength(1)
            expect(wrapper.exists('div[data-testid="message.subject"]')).toBeFalsy()
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            logger.info("--- THIRD VERIFICATION ---")
            wrapper.update()
            expect(wrapper.exists('div[data-testid="message.loading"]')).toBeFalsy()
            let messages = wrapper.find('div[data-testid="message.subject"]')
            expect(messages).toHaveLength(3)
            expect(messages.at(0).text()).toBe('Hello, World')
            expect(messages.at(1).text()).toBe('Yo, World')
            expect(messages.at(2).text()).toBe('こんにちは')
          }
        },
        {
          actionType: pollingActionCreators.requestInboxPolling().type,
          onUpdated: () => {
            logger.info("--- FIRST VERIFICATION ---")
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeUndefined()
            wrapper.update()
            expect(wrapper.exists('div[data-testid="message.loading"]')).toBeFalsy()
            let messages = wrapper.find('div[data-testid="message.subject"]')
            expect(messages).toHaveLength(2)
            expect(messages.at(0).text()).toBe('Hello, World')
            expect(messages.at(1).text()).toBe('Yo, World')
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
