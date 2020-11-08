import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, useReactiveVar } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { Login } from './login/login';
import { currentLanguageVar, tokenVar } from './reactive-var';
import _ from 'lodash';
import config from './config.json'
import './app.scss'

const httpLink = createHttpLink({
  uri: config.GRAPH_URL,
})

const authLink = setContext((_, { headers }) => ({
  ...headers,
  authorization: tokenVar()
}))

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

const App = () => {
  const currentLangage = useReactiveVar(currentLanguageVar)
  const token = useReactiveVar(tokenVar)

  const onLogout = () => {
    client.resetStore()
    tokenVar('')
  }

  return (
    <ApolloProvider client={client}>
      <div className={'app ' + currentLangage}>
        <div className="header">
          {
            !_.isEmpty(token) ? <div onClick={onLogout}>Logout</div> : null
          }
        </div>
        {

          _.isEmpty(token) ? <Login />
            :
            <div>login success</div>
        }
      </div>
    </ApolloProvider>
  )
}

export default App;
