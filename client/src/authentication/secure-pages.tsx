import _ from 'lodash'
import React from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { passwordResetRequiredVar, tokenVar, userIdVar } from 'global/var'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_MAINTAIN_MEMBERS, ROUTE_UPDATE_PASSWORD } from 'global/const'
import { UpdatePassword } from './update-password'
import { gql, useQuery, useReactiveVar } from '@apollo/client'
import { AuthHeader } from './auth-header'
import { SideMenu } from 'menu/side-menu'

import './secure-pages.scss'
import { LogonUserQuery, LogonUserQueryVariables } from './__generated__/LogonUserQuery'
import { MaintainMembers } from 'member/maintain-members'

const LOGON_USER = gql`
    query LogonUserQuery($id: ID!) {
        member(id: $id) {
            id
            english_given_name
            english_surname
            chinese_given_name
            chinese_surname
            groups {
                id
                name
            }
        }
    }
`

export const SecurePages = () => {
    const history = useHistory()
    const { loading } = useQuery<LogonUserQuery, LogonUserQueryVariables>(LOGON_USER, {
        variables: {
            id: userIdVar()
        }
    })
    const passwordResetRequired = useReactiveVar(passwordResetRequiredVar)

    if (_.isEmpty(tokenVar())) {
        history.push(ROUTE_LOGIN)
    }

    if (loading) {
        return <div className="loader" />
    }

    if (passwordResetRequired) {
        return (
            <div className="secure-pages">
                <AuthHeader />
                <UpdatePassword />
            </div>
        )
    }

    return (
        <div className="secure-pages">
            <SideMenu />
            <Switch>
                <Route path={ROUTE_UPDATE_PASSWORD}>
                    <UpdatePassword />
                </Route>
                <Route path={ROUTE_MAIN}>
                    <Main />
                </Route>
                <Route path={ROUTE_MAINTAIN_MEMBERS}>
                    <MaintainMembers />
                </Route>
                <Route path="/">
                    <Redirect to={ROUTE_MAIN} />
                </Route>
            </Switch>
        </div>
    )
}

const Main = () => <div><br /><br />Main Screen Placeholder</div>