import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react'
import _ from 'lodash'
import { t, T } from '../translations/translate';
import { Login as TLogin, LoginVariables } from './__generated__/Login';
import { tokenVar } from '../global/reactive-var';
import { useHistory } from 'react-router-dom';
import { ROUTE_MAIN, ROUTE_RESET_PASSWORD } from '../global/routes';

import './login-reset-password.scss'
import { AuthHeader } from './auth-header';

const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(userName: $username, password: $password) {
            token
            password_reset_required
        }
    }
`

export const Login = () => {
    const history = useHistory()
    const [login] = useMutation<TLogin, LoginVariables>(LOGIN)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)
    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)

    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onLogin()
        }
    }

    const onLogin = () => {
        login({
            variables: {
                username,
                password
            }
        }).then(response => {
            console.log(response)
            if (response.errors) {
                alert(t('login:error'))
            } else if (!response.data?.login?.token || response.data.login.password_reset_required === undefined) {
                alert(t("login:invalid"))
            } else {
                tokenVar(response.data.login.token)

                if(response.data.login.password_reset_required) {
                    history.push(ROUTE_RESET_PASSWORD)
                } else {
                    history.push(ROUTE_MAIN)
                }
            }
        }).catch(() => {
            alert(t('login:error'))
        })
        setPassword('')
    }

    return (
        <div className="login">
            <AuthHeader />
            <div className="login-inputs">
                <label htmlFor="username"><T k="login:userNameLabel" /></label>
                <input type="text" id="username" name="username" autoCapitalize="none" autoCorrect="off" onChange={onChangeUsername} onKeyPress={onKeyPress} />
                <label htmlFor="password"><T k="login:password" /></label>
                <input type="password" id="password" name="password" value={password} onChange={onChangePassword} onKeyPress={onKeyPress} />
                <button onClick={onLogin} disabled={_.isEmpty(username) || _.isEmpty(password)}><T k="login:signinButtonText" /></button>
            </div>
        </div>
    )
}
