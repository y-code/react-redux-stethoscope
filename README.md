# React-Redux Stethoscope
A testing utility for React-Redux apps that provides hooks to run tests after each redux action.

[![npm version](https://badge.fury.io/js/react-redux-stethoscope.svg)](https://badge.fury.io/js/react-redux-stethoscope)

## The problem to solve
When you want to test a React component after an operation that dispatches a Redux action, you need to make it sure that before your test code goes, all the React components connected to the Redux store are thoroughly updated based on the new state. You can easily assure it with `act()` provided by [React Test Utility](https://reactjs.org/docs/test-utils.html#act) or [Testing Library for React](https://testing-library.com/docs/react-testing-library/api#act).

However, it cannot help when a test target operation dispatches Redux actions asynchronously, like the thunk action below.

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

When you simulate an operation inside an `act()`'s callback to test the result, the test code after the `act()` call may test a result of the first action, or possibly a result of the second one.

## This solution
React-Redux Stethoscope can handle such a case. It can target specific Redux actions, and run test code after each action entirely takes effect on all the React components.

With React-Redux Stethoscope, test code against the Redux actions becomes like this.

```jsx
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
      wrapper.getAllByText('↺')[0].click()
    },
    targets: [
      {
        actionType: actionCreators.requestMessages().type,
        onUpdated: () => {
          const loadingMessage = wrapper.getAllByText('Loading...')
          expect(loadingMessage).toHaveLength(1)
        }
      },
      {
        actionType: actionCreators.receiveMessages({}).type,
        onUpdated: () => {
          const firstMessage = wrapper.getAllByText('Hello, World')
          expect(firstMessage).toHaveLength(1)
        }
      },
    ]
  })
}
```

`listenAsync()` function runs `act` property of its parameter object over the [`act()` of React Test Utility](https://reactjs.org/docs/test-utils.html#act), and waits for a Redux action to be dispatched. When the dispatched action matches one of the action types specified in the `targets` property, Stethoscope calls back the function in the corresponding `onUpdated` property. `listenAsync()` keeps waiting until all the action types in the `targets` are dispatched.

> `act` property of the object provided to `listenAsync()` function is simply passed to [`act()` of React Test Utility](https://reactjs.org/docs/test-utils.html#act). So, other than simulating operations, you can also directly dispatch actions to your Redux store in the function of the `act` property.

When the waiting time exceeds 3 seconds, Stethoscope throws an error. You can modify the timeout length by specifying `timeout` property in the parameter object in milliseconds.

## Installation
You can install this module via [npm](https://www.npmjs.com/) which is bundled with [node](https://nodejs.org/), and it should be installed as one of your `devDependencies`.
```
npm install --save-dev react-redux-stethoscope
```
You also can install it via [yarn](https://classic.yarnpkg.com/en/).
```
yarn add --dev react-redux-stethoscope
```

This library has `peerDependencies` listings for `react` and `react-dom`.

## Set-up
React-Redux Stethoscope requires a set-up before your tests run with it. It can be done by just calling `useStethoscope()` once. If you use Jest, then add this function call in setupTests.js or setupTests.ts.

Then, in your test code, instantiate Stethoscope and make sure to add the Redux middleware of Stethoscope when you create Redux store. The middleware is generated by `asMiddleware()` function.

Now, Stethoscope is ready to call `listenAsync()` to test each action dispatch.

## Usage with Enzyme
You can also use [Enzyme](https://enzymejs.github.io/enzyme/) to render react components and simulate operations with React-Redux Stethoscope. The set-up and usage of Stethoscope are all in the same manner.
