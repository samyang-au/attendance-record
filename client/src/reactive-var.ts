import { makeVar } from "@apollo/client"

export type Languages = 'en' | 'ch'
export const currentLanguageVar = makeVar<Languages>('en')

export const tokenVar = makeVar('')
export const passwordResetRequiredVar = makeVar(false)