import React, { useState } from 'react'
import { t, T } from 'translations/translate'
import { AuthHeader } from './auth-header'
import { passwordComplexityCheck, passwordValidationErrorList } from '@common/common'
import { gql, useMutation } from '@apollo/client'
import { UpdatePasswordMutation, UpdatePasswordMutationVariables } from './__generated__/UpdatePasswordMutation'
import _ from 'lodash'

import './login-update-password.scss'
import { useHistory } from 'react-router-dom'
import { ROUTE_MAIN } from 'global/const'
import { passwordResetRequiredVar } from 'global/var'

const UPDATE_PASSWORD_MUTATION = gql`
    mutation UpdatePasswordMutation($password: String!) {
        updatePassword(password: $password)
    }
`

export const UpdatePassword = () => {
    const history = useHistory()
    const [updatePassword] = useMutation<UpdatePasswordMutation, UpdatePasswordMutationVariables>(UPDATE_PASSWORD_MUTATION)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordErrors, setPasswordErrors] = useState<string[]>(passwordComplexityCheck(''))

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
        setPasswordErrors(passwordComplexityCheck(e.target.value))
    }
    const onChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)

    const onKeyPress =(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onUpdatePassword()
        }
    }

    const onUpdatePassword = () => {
        updatePassword({
            variables: {
                password
            }
        }).then(response => {
            if(response.data == null || !_.isEmpty(response.data.updatePassword)) {
                alert(t('password:error:unable-to-update'))
            } else {
                passwordResetRequiredVar(false)
                history.push(ROUTE_MAIN)
            }
        })
    }

    return (
        <div className="update-password">
            <AuthHeader />
            <div className="login-inputs">
                <label htmlFor="password"><T k="password:new-password" /></label>
                <input type="password" id="password" name="password" value={password} onChange={onChangePassword} onKeyPress={onKeyPress} />
                <div className="validation-error-list">
                    {
                        passwordValidationErrorList.map((possibleValidationError, index) => (
                            <T key={index} className={passwordErrors.indexOf(possibleValidationError) > -1 ? 'fail' : 'pass'} k={possibleValidationError} />
                        ))
                    }
                </div>
                <label className="confirm-password-label" htmlFor="confirm-password"><T k="password:confirm-password" /></label>
                <input type="password" id="confirm-password" name="confirm-password" value={confirmPassword} onChange={onChangeConfirmPassword} onKeyPress={onKeyPress} />
                <T className={password === confirmPassword ? 'pass' : 'fail'} k="password:error:confirm-match" />
                <button disabled={password !== confirmPassword || passwordErrors.length > 0} onClick={onUpdatePassword}><T k="password:update-password" /></button>
            </div>
        </div>
    )
}