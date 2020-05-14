import React from 'react'
import configureStore from '../store/configureStore'
import { render } from '@testing-library/react'
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

describe('Stethoscope with react-redux', () => {

  const logger = getLogger('React-Redux Stethoscope Tests')

  beforeEach(() => {
    fetchMock.doMock
    configureFetch()
  })

  afterEach(() => fetch.restore())
  afterAll(fetchMock.dontMock)

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
            const loadingMessage = wrapper.getAllByText('Loading...')
            expect(loadingMessage).toHaveLength(1)
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
            const firstMessage = wrapper.getAllByText('Hello, World')
            expect(firstMessage).toHaveLength(1)
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
            const firstMessage = wrapper.getAllByText('Hello, World')
            expect(firstMessage).toHaveLength(1)
          }
        },
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            const loadingMessage = wrapper.getAllByText('Loading...')
            expect(loadingMessage).toHaveLength(1)
          }
        },
      ]
    })
  })

  it('calls back when all the connected React components finished re-render for each action, even when there\'s parallel async dispatch calls. [with React Testing Library]', async () => {
    const stethoscope = new Stethoscope()
    var store = configureStore(undefined, [ stethoscope.asMiddleware() ])

    const wrapper = render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    await stethoscope.listenAsync({
      act: () => {
        logger.debug("=== OPERATION ===")
        store.dispatch(pollingThunkCreators.requestPolling() as any)
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: () => {
            logger.info("=== SECOND VERIFICATION ===")
            const loadingMessage = wrapper.getAllByText('Loading...')
            expect(loadingMessage).toHaveLength(1)
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: () => {
            logger.info("=== THIRD VERIFICATION ===")
            const firstMessage = wrapper.getAllByText('Hello, World')
            expect(firstMessage).toHaveLength(1)
          }
        },
        {
          actionType: pollingActionCreators.requestInboxPolling().type,
          onUpdated: () => {
            logger.info("=== FIRST VERIFICATION ===")
            let state = store.getState() as AppState;
            expect(state.polling.inbox).toBeUndefined()
          }
        },
      ]
    })
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
        wrapper.find('button[data-key="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: async () => {
            wrapper.update()
            const firstMessage = await wrapper.find('div[data-key="message.subject"]')
            expect(firstMessage.exists()).toBeFalsy()
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
        wrapper.find('button[data-key="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: async () => {
            wrapper.update()
            const message = await wrapper.find('div[data-key="message.subject"]')
            expect(message.exists()).toBeTruthy();
            expect(message.at(0).text()).toEqual('Hello, World')
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
        wrapper.find('button[data-key="btn-get-messages"]')
          .at(0).simulate('click')
      },
      targets: [
        {
          actionType: inboxActionCreators.requestMessages().type,
          onUpdated: async () => {
            wrapper.update()
            const firstMessage = await wrapper.find('div[data-key="message.subject"]')
            expect(firstMessage.exists()).toBeFalsy()
          }
        },
        {
          actionType: inboxActionCreators.receiveMessages({}).type,
          onUpdated: async () => {
            wrapper.update()
            const message = await wrapper.find('div[data-key="message.subject"]')
            expect(message.exists()).toBeTruthy();
            expect(message.at(0).text()).toEqual('Hello, World')
          }
        },
      ]
    })
  })
})
