import Express from 'express';
import React from 'react';
import createLocation from 'history/lib/createLocation';
import config from './config';
import session from 'express-session';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import api from './api/api';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import App from './App';
import universalRouter from './helpers/universalRouter';
import Html from './helpers/Html';
import PrettyError from 'pretty-error';

const pretty = new PrettyError();
const app = new Express();
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:' + config.apiPort
});

app.use(session({
  secret: 'react and redux rule!!!!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

app.use(require('serve-static')(path.join(__dirname, '..', 'static')));

// Proxy to API server
app.use('/api', (req, res) => {
  proxy.web(req, res);
});

// added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
proxy.on('error', (error, req, res) => {
  let json;
  console.log('proxy error', error);
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  json = { error: 'proxy_error', reason: error.message };
  res.end(JSON.stringify(json));
});

app.use((req, res) => {
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const client = new ApiClient(req);
  const store = createStore(client);
  const location = createLocation(req.url);

  const hydrateOnClient = function() {
    res.send('<!doctype html>\n' +
      React.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={<div/>} store={store}/>));
  }

  universalRouter(location, undefined, store).then(({component, redirect, isRedirect}) => {
    if (isRedirect) {
      res.redirect(redirect.pathname + redirect.search);
      return;
    }

    res.send('<!doctype html>\n' +
      React.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={component} store={store}/>));
  })
  .catch((error) => {
    if (error.redirect) {
      res.redirect(error.redirect);
      return;
    }
    console.error('ROUTER ERROR:', pretty.render(error));
    hydrateOnClient(); // let client render error page or re-request data
  });

});

if (config.port) {
  app.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    } else {
      api().then(() => {
        console.info('==> ✅  Server is listening');
        console.info('==> 🌎  %s running on port %s, API on port %s', config.app.name, config.port, config.apiPort);
        console.info('----------\n==> 💻  Open http://localhost:%s in a browser to view the app.', config.port);
      });
    }
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
