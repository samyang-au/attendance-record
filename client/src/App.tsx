import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, useReactiveVar, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import { Login } from './authentication/login';
import { currentLanguageVar, tokenVar } from './global/reactive-var';
import config from './config.json'
import './app.scss'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { SecurePages } from './authentication/secure-pages';
import { ROUTE_LOGIN, ROUTE_SECURE } from './global/routes';

const httpLink = createHttpLink({
  uri: config.GRAPH_URL,
})

const authMiddleware = setContext((_, { headers }) => ({
  ...headers,
  authorization: tokenVar()
}))

const logoutMiddleware = onError(({ networkError }) => {
  console.log('networkError', networkError)
})

const client = new ApolloClient({
  link: from([
    authMiddleware,
    logoutMiddleware,
    httpLink
  ]),
  cache: new InMemoryCache()
})

const App = () => {
  const currentLangage = useReactiveVar(currentLanguageVar)

  const onLogout = () => {
    client.resetStore()
    tokenVar('')
  }

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <div className={'app ' + currentLangage}>
          <Switch>
            <Route path={ROUTE_LOGIN}>
              <Login />
            </Route>
            <Route path={ROUTE_SECURE}>
              <SecurePages />
            </Route>
            <Route path="/">
              <Redirect to={ROUTE_LOGIN} />
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  )
}

export default App;
