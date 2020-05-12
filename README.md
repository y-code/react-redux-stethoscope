# React-Redux Stethoscope
A testing utility for React-Redux apps that provides hooks to run tests after each redux action.

When you want to test a React component after an operation that dispatches a Redux action, you need to make it sure that before your test code goes, all the React components connected to the Redux store are thoroughly updated based on the new state. You can easily assure it with `act()` provided by [React Test Utility](https://reactjs.org/docs/test-utils.html#act) or [Testing Library for React](https://testing-library.com/docs/react-testing-library/api#act). However, it cannot help when a test target operation dispatches Redux actions asynchronously.

For example, if you simulate an operation which dispatches a thunk action to fetch some data from an API, in the `act()`'s callback, the test code after `act()` call may test a result of the action before the fetch, or possibly test a result of the action after the fetch.

```javascript
export const thunkCreators = {
  requestMessages: () =>
    (dispatch, getState) => {
      // action dispatch before the fetch
      dispatch(actionCreators.requestMessages())

      return fetch('/api/inbox/messages', { method: 'GET' })
        .then(response => response.json())
        .then(json => {
          // action dispatch after the fetch
          return dispatch(actionCreators.receiveMessages(json))
        })
    },
}
```

React-Redux Stethoscope can handle such a case. It can target specific Redux actions and run test code after each action entirely takes effect on React components.

## Sample Code

Test code with React-Redux Stethoscope looks like this.

```javascript
it('display "Loading..." while fetching data.', async () => {
  const stethoscope = new Stethoscope()

  const store = createStore(
    rootReducer,
    undefined,
    compose(applyMiddleware([ thunk, stethoscope.asMiddleware() ]), ...enhancers))

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
      {
        actionType: inboxActionCreators.receiveMessages({}).type,
        onUpdated: () => {
          const firstMessage = wrapper.getAllByText('Hello, World')
          expect(firstMessage).toHaveLength(1)
        }
      },
    ]
  })
}
```

In the sample code above, [Testing Library for React](https://testing-library.com/docs/react-testing-library/api#act) is used to render a react component, but you can also use Enzyme with React-Redux Stethoscope.

## Set-up
React-Redux Stethoscope requires a set-up before your tests run with it. It can be done only by calling `useStethoscope()` once. If you use Jest, then add this function call in setupTests.js or setupTests.ts.
