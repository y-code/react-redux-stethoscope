import * as redux from 'redux'
import thunk from 'redux-thunk'
import { AppState } from './'
import * as inbox from './inbox';
import * as polling from './polling'

export default function configureStore(initialState?: AppState, extraMiddlewares: redux.Middleware[] = []): redux.Store {
  let middlewares = [
    thunk,
    ...extraMiddlewares,
  ] as (redux.Middleware)[]
  let enhancers = [
  ] as ((b: any) => redux.StoreEnhancerStoreCreator<{dispatch: redux.Dispatch<redux.AnyAction>}, {}>)[]

  if ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    enhancers = [ (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(), ...enhancers ]
  }

  const rootReducer = redux.combineReducers({
    polling: polling.reducer,
    inbox: inbox.reducer,
  })

  return redux.createStore(
    rootReducer,
    initialState,
    redux.compose(redux.applyMiddleware(...middlewares), ...enhancers))
}
