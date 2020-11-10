import { makeVar } from "@apollo/client"

export type Languages = 'en' | 'ch'
export const currentLanguageVar = makeVar<Languages>('en')

let tok = ''
export const tokenVar = (token?: string) => {
    if (token) {
        tok = token
    }
    return tok
}
