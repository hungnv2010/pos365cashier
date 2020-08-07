import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import { composeWithDevTools } from 'remote-redux-devtools';
// import { persistStore } from "redux-persist";
import reducer from '../reducers';

/*product bo devtool -composeWithDevTools chi de lai apply middleware*/
function configureStore(initialState) {

  const store = createStore(
    reducer,
    initialState,
    // composeWithDevTools(
    applyMiddleware(thunk),
    // )
  );


  if (module.hot) {
    // Enable hot module replacement for reducers
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};


const store = configureStore();
// export const persistor = persistStore(store);
export default store;


