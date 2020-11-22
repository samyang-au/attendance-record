import React from 'react'
import { useReactiveVar } from '@apollo/client'

import en from './en.json'
import ch from './ch.json'
import { currentLanguageVar } from 'global/var'

export type TranslationKey = keyof typeof en

/**
 * Use this when adding tranlation to components so it'll respond
 * to language updates.
 */
export const T = ({ k: key, className, onClick }: { k: TranslationKey, className?: string, onClick?: React.DOMAttributes<HTMLDivElement>['onClick'] }) => {
    const currentLangage = useReactiveVar(currentLanguageVar)
    const translations = currentLangage === 'en' ? en : ch

    return (
        <div onClick={onClick} className={currentLangage + (className ? ' ' + className : '')}>{translations[key]}</div>
    )
}

/**
 * Use this to translate text in alerts
 */
export const t = (key: TranslationKey) => {
    const translations = currentLanguageVar() === 'en' ? en : ch
    return translations[key]
}