import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react'
import _ from 'lodash'
import { t, T } from 'translations/translate';
import { passwordResetRequiredVar, tokenVar } from 'global/var';
import { useHistory } from 'react-router-dom';
import { ROUTE_MAIN, ROUTE_UPDATE_PASSWORD } from 'global/const';
import { AuthHeader } from './auth-header';
import { LoginMutation, LoginMutationVariables } from './__generated__/LoginMutation';

import './login-update-password.scss'

const LOGIN_MUTATION = gql`
    mutation LoginMutation($username: String!, $password: String!) {
        login(userName: $username, password: $password) {
            token
            password_reset_required
            member_info {
                english_given_name
                english_surname
                chinese_given_name
                chinese_surname
            }
        }
    }
`

export const Login = () => {
    const history = useHistory()
    const [login] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)
    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)

    const onKeyPress =(e: React.KeyboardEvent<HTMLInputElement>) => {
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
            if (response.errors) {
                alert(t('login:error'))
            } else if (!response.data?.login?.token || response.data.login.password_reset_required === undefined) {
                alert(t("login:invalid"))
            } else {
                tokenVar(response.data.login.token)
                passwordResetRequiredVar(response.data.login.password_reset_required || false)

                if(response.data.login.password_reset_required) {
                    history.push(ROUTE_UPDATE_PASSWORD)
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
