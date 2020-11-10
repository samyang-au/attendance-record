import React, { useState } from 'react'
import { T } from 'translations/translate'
import { AuthHeader } from './auth-header'
import { passwordComplexityCheck } from '@common/common'

import './login-reset-password.scss'

export const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
        passwordComplexityCheck(e.target.value)
    }
    const onChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)

    return (
        <div className="reset-password">
            <AuthHeader />
            <div className="login-inputs">
                <label htmlFor="password"><T k="reset-password:new-password" /></label>
                <input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
                <label htmlFor="confirm-password"><T k="reset-password:confirm-password" /></label>
                <input type="password" id="confirm-password" name="confirm-password" value={confirmPassword} onChange={onChangeConfirmPassword} />
                <button disabled={true}><T k="reset-password:update-password" /></button>
            </div>
        </div>
    )
}