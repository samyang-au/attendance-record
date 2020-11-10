import _ from 'lodash'
import React from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { passwordResetRequiredVar, tokenVar } from 'global/var'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_UPDATE_PASSWORD } from 'global/const'
import { UpdatePassword } from './update-password'
import { useReactiveVar } from '@apollo/client'

export const SecurePages = () => {
    const history = useHistory()
    const passwordResetRequired = useReactiveVar(passwordResetRequiredVar)

    if (_.isEmpty(tokenVar())) {
        history.push(ROUTE_LOGIN)
    }

    if (passwordResetRequired) {
        return <UpdatePassword />
    }

    return (
        <div className="secure-pages">
            secure-pages
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
        </div>
    )
}

const Main = () => <div>Main</div>