import React from 'react'

import logo from 'img/tjc_logo.png'
import { Language } from 'translations/language'

import './auth-header.scss'

export const AuthHeader = () => (
    <header className="auth-header">
        <img src={logo} className="logo" alt="logo" />
        <Language />
    </header>
)