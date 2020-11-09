import { useReactiveVar } from '@apollo/client'
import _ from 'lodash'
import React from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { tokenVar } from '../global/reactive-var'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_RESET_PASSWORD } from '../global/routes'
import { ResetPassword } from './reset-password'

export const SecurePages = () => {
    const history = useHistory()
    const token = useReactiveVar(tokenVar)

    if(_.isEmpty(token)) {
        history.push(ROUTE_LOGIN)
    }

    return (
        <Switch>
            <Route path={ROUTE_RESET_PASSWORD}>
                <ResetPassword />
            </Route>
            <Route path={ROUTE_MAIN}>
                <Main />
            </Route>
            <Route path="/">
                <Redirect to={ROUTE_MAIN} />
            </Route>
        </Switch>
    )
}

const Main = () => <div>Main</div>