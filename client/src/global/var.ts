import { makeVar } from "@apollo/client"
import { TokenContent } from "common/token-content-type"
import jws from 'jws'

export type Languages = 'en' | 'ch'
export const currentLanguageVar = makeVar<Languages>('en')

const TOKEN = 'token'
let tokenExpiry = -1
let privateToken = ''
export const tokenVar = (token?: string) => {
    if (token !== undefined) {
        localStorage.setItem(TOKEN, token)
    }

    if(tokenExpiry === -1) {
        const localStorageToken = localStorage.getItem(TOKEN)
        privateToken = localStorageToken || ''

        if (privateToken === '') {
            return ''
        }

        const { expiry } = JSON.parse(jws.decode(privateToken).payload) as TokenContent
        tokenExpiry = expiry
    }

    if(tokenExpiry < Date.now()) {
        tokenExpiry = -1
        privateToken = ''
        localStorage.setItem(TOKEN, '')
        return ''
    }

    return privateToken
}

export const passwordResetRequiredVar = makeVar(false)