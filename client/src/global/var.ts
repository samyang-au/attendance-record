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

        const { id, expiry, groups } = JSON.parse(jws.decode(privateToken).payload) as TokenContent
        tokenExpiry = expiry
        privateUserId = id.toString()
        privateUserGroups = groups
    }

    if(tokenExpiry < Date.now()) {
        localStorage.setItem(TOKEN, '')
        privateUserId = ''
        tokenExpiry = -1
        privateToken = ''
        return ''
    }

    return privateToken
}

let privateUserId: string = ''
export const userIdVar = (userId?: string) => {
    if(userId !== undefined) {
        privateUserId = userId
    }

    if(privateUserId === '' && privateToken === '') {
        tokenVar()
    }

    return privateUserId
}

let privateUserGroups: string[] = []
export const userGroupsVar = (userGroups?: string[]) => {
    if(userGroups !== undefined) {
        privateUserGroups = userGroups
    }

    if(privateUserId === '' && privateToken === '') {
        tokenVar()
    }

    return privateUserGroups
}

export const passwordResetRequiredVar = makeVar(false)