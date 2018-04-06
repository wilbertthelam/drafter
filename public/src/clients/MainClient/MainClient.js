import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers/reducer';

const store = createStore(reducer, {}, applyMiddleware(thunk));

class MainClient extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div>Hello Main Client World</div>
      </Provider>
    );
  }
}

export default MainClient;
