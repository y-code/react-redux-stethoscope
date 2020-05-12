import fetchMock from 'fetch-mock'
import * as store from '.'
import logger from '../logger'

const url2polling = /^\/api\/inbox\/polling$/
const url2messages = /^\/api\/inbox\/messages$/

export default function configureFetch() {
  fetchMock.mock(url2polling, async (url, req) => {
    const counter = fetchMock.calls(url2polling).length % 5
    logger.info(`[Fetch Mock] received an expected request to ${url} (${counter})`)

    return {
      status: 200,
      body: JSON.stringify({
        messages: counter === 1,
      }),
    }
  })

  fetchMock.mock(url2messages, async (url, req) => {
    const counter = fetchMock.calls(url2messages).length
    logger.info(`[Fetch Mock] received an expected request to ${url} (${counter})`)

    const data: store.Message[] = [
      {
        id: 90001,
        from: 'zzz@gmail.com',
        to: 'aaa@gmail.com',
        subject: 'Hello, World',
        content: 'I just wanted to say, "Hello, World"',
      },
      {
        id: 90002,
        from: 'yyy@gmail.com',
        to: 'aaa@gmail.com',
        subject: 'Yo, World',
        content: 'I just wanted to say, "Yo, World"',
      },
    ]
    if (counter > 1) {
      data.push({
        id: 90003,
        from: 'xxx@gmail.com',
        to: 'aaa@gmail.com',
        subject: 'こんにちは',
        content: 'I just wanted to say, "こんにちは、世界の皆さん"',
      })
    }

    return {
      status: 200,
      body: JSON.stringify({
        messages: data,
      }),
    }
  })

  fetchMock.mock(/^.+$/, async (url, req) => {
    console.error(`[Fetch Mock] received an unexpected request to ${url}`)
    return {
      status: 500,
      body: 'This is a response from mocked fetch.',
    }
  })
}