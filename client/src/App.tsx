import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, useReactiveVar } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import logo from './img/tjc_logo.png'

import './App.css';
import { Login } from './login/login';
import { Language } from './translations/language';
import { currentLanguageVar, tokenVar } from './reactive-var';
import _ from 'lodash';

const httpLink = createHttpLink({
  uri: 'https://localhost:433/graphql',
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
          <img src={logo} alt="logo" />
          <Language />
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
