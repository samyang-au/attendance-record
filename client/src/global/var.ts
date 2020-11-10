import { makeVar } from "@apollo/client"

export type Languages = 'en' | 'ch'
export const currentLanguageVar = makeVar<Languages>('en')

let tok = ''
export const tokenVar = (token?: string) => {
    if (token) {
        tok = token
        localStorage.setItem('token', token)
    }
    return tok || localStorage.getItem('token') || ''
}
