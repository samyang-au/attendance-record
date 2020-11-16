import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, useReactiveVar, from, ApolloLink } from '@apollo/client'
import { Login } from './authentication/login';
import { currentLanguageVar, tokenVar } from './global/var';
import config from './config.json'
import './app.scss'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { SecurePages } from './authentication/secure-pages';
import { ROUTE_LOGIN, ROUTE_SECURE } from './global/const';

const httpLink = createHttpLink({
  uri: config.GRAPH_URL,
})

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: tokenVar()
    }
  })
  return forward(operation)
})

const client = new ApolloClient({
  link: from([
    authMiddleware,
    httpLink
  ]),
  cache: new InMemoryCache()
})

const App = () => {
  const currentLangage = useReactiveVar(currentLanguageVar)

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
              <Redirect to={ROUTE_LOGIN}/>
            </Route>
          </Switch>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  )
}

export default App;
