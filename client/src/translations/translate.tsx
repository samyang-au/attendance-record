import React from 'react'
import { useReactiveVar } from '@apollo/client'

import en from './en.json'
import ch from './ch.json'
import { currentLanguageVar } from 'global/reactive-var'

/**
 * Use this when adding tranlation to components so it'll respond
 * to language updates.
 */
export const T = ({ k: key }: { k: keyof typeof en }) => {
    const currentLangage = useReactiveVar(currentLanguageVar)
    const translations = currentLangage === 'en' ? en : ch

    return (
        <div className={currentLangage}>{translations[key]}</div>
    )
}

/**
 * Use this to translate text in alerts
 */
export const t = (key: keyof typeof en) => {
    const translations = currentLanguageVar() === 'en' ? en : ch
    return translations[key]
}