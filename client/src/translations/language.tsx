import React from 'react'
import { useReactiveVar } from '@apollo/client'
import { currentLanguageVar } from '../reactive-var'


export const Language = () => {
    const currentLangage = useReactiveVar(currentLanguageVar)

    const onLanguageClick = () => {
        if (currentLangage === 'en') {
            currentLanguageVar('ch')
        } else {
            currentLanguageVar('en')
        }
    }

    return (
        <div onClick={onLanguageClick}>
            {
                currentLangage === 'en' ? "中文" : "English"
            }
        </div>
    )
}