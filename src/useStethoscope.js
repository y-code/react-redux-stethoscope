import stub from 'sinon/lib/sinon/stub'
import * as redux from 'redux'

const useStethoscope = function () {
  const _applyMiddleware = redux.applyMiddleware
  stub(redux, 'applyMiddleware').callsFake(function (...middlewares) {
    let stethoscope
    for (const middleware of middlewares) {
      if (middleware.stethoscope) {
        stethoscope = middleware.stethoscope
      }
    }

    if (middlewares.length) {
      const firstOne = middlewares[0]
      middlewares[0] = (store) => {
        let dispatchChainPiece = firstOne(store)
        const _dispatchChainPiece = dispatchChainPiece
        dispatchChainPiece = (dispatch) =>
          _dispatchChainPiece((action) => stethoscope.execute(dispatch, action))
        return dispatchChainPiece
      }
    }

    const enhancer = _applyMiddleware.bind(this)(...middlewares)

    const extendedEnhancer = (createStore) => {
      const enhancerStoreCreator = enhancer(createStore)
      return (...args) => {
        const store = enhancerStoreCreator(...args)
        store.stethoscope = stethoscope
        return store
      }
    }

    return extendedEnhancer
  })
}

export default useStethoscope
