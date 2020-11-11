import { useApolloClient } from '@apollo/client'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_UPDATE_PASSWORD } from 'global/const'
import { tokenVar } from 'global/var'
import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Language } from 'translations/language'
import { T } from 'translations/translate'

import './side-menu.scss'

enum ExpandStateEnum {
    Expanded,
    Collapsed
}

export const SideMenu = () => {
    const client = useApolloClient()
    const history = useHistory()
    const [expandState, setExpandState] = useState<ExpandStateEnum>(ExpandStateEnum.Collapsed)

    const onExpand = () => {
        setExpandState(ExpandStateEnum.Expanded)
    }

    const onCollapse = () => {
        setExpandState(ExpandStateEnum.Collapsed)
    }

    const onLogout = () => {
        tokenVar('')
        client.resetStore()
        history.push(ROUTE_LOGIN)
    }

    return (
        <div className={"side-menu " + (ExpandStateEnum[expandState])}>
            <div className="overlay" onClick={onCollapse}/>
            <div className="expand-toggle" onClick={expandState === ExpandStateEnum.Collapsed ? onExpand : onCollapse} />
            <div className="menu-content">
                <Link to={ROUTE_MAIN} onClick={onCollapse}><T k="menu:main" /></Link>
                <Link to={ROUTE_UPDATE_PASSWORD}  onClick={onCollapse}><T k="menu:update-password" /></Link>
                <Language />
                <T k="menu:logout" onClick={onLogout} />
            </div>
        </div>
    )
}