import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react'
import _ from 'lodash'
import { t, T } from '../translations/translate';
import { Login as TLogin, LoginVariables } from './__generated__/Login';
import { passwordResetRequiredVar, tokenVar } from '../reactive-var';
import { Language } from '../translations/language';

import logo from '../img/tjc_logo.png'
import './login.scss'

const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(userName: $username, password: $password) {
            token
            passwordResetRequired
        }
    }
`

export const Login = () => {
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
            } else if (!response.data?.login?.token || !response.data.login.passwordResetRequired) {
                alert(t("login:invalid"))
            } else {
                passwordResetRequiredVar(response.data.login.passwordResetRequired)
                tokenVar(response.data.login.token)
            }
        }).catch(() => {
            alert(t('login:error'))
        })
        setPassword('')
    }

    return (
        <div className="login">
            <header>
                <img src={logo} className="logo" alt="logo" />
                <Language />
            </header>
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
