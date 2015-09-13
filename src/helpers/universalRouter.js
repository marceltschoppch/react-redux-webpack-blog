import React from 'react';
import Router from 'react-router'
import createRoutes from '../routes';
import {Provider} from 'react-redux';
import createHistory from 'history/lib/createMemoryHistory';

const getFetchData = (component = {}) => {
  return component.WrappedComponent ?
    getFetchData(component.WrappedComponent) :
    component.fetchData;
};

export function createTransitionHook(store) {
  return (nextState, transition, callback) => {
    const { params, location: { query } } = nextState;
    const promises = nextState.branch
      .map(route => route.component)                          // pull out individual route components
      .filter((component) => getFetchData(component))         // only look at ones with a static fetchData()
      .map(getFetchData)                                      // pull out fetch data methods
      .map(fetchData => fetchData(store, params, query || {}));  // call fetch data methods and save promises
    Promise.all(promises)
      .then(() => {
        callback(); // can't just pass callback to then() because callback assumes first param is error
      }, (error) => {
        callback(error);
      });
  };
}

export default function universalRouter(location, history, store) {
  const routes = createRoutes(store);
  return new Promise((resolve, reject) => {
    const component = (
      <Provider store={store} key="provider">
        {() => <Router history={createHistory()} location={location} routes={routes} />}
      </Provider>
    );

    return resolve({
      component,
      isRedirect: false
    });
  });
}