import React from 'react';
import {Route} from 'react-router';
import App from './App';

export default function(store) {
  return (
    <Route path="/" component={App} store={store}>
    </Route>
  );
}
