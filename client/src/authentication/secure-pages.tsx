import _ from 'lodash'
import React from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { tokenVar } from 'global/var'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_UPDATE_PASSWORD } from 'global/const'
import { UpdatePassword } from './update-password'

export const SecurePages = () => {
    const history = useHistory()

    if(_.isEmpty(tokenVar())) {
        history.push(ROUTE_LOGIN)
    }

    return (
        <Switch>
            <Route path={ROUTE_UPDATE_PASSWORD}>
                <UpdatePassword />
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