import React from 'react'

import logo from 'img/tjc_logo.png'
import { Language } from 'translations/language'

export const AuthHeader = () => (
    <header>
        <img src={logo} className="logo" alt="logo" />
        <Language />
    </header>
)