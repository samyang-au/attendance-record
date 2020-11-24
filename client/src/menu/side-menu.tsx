import { useApolloClient } from '@apollo/client'
import { ROUTE_LOGIN, ROUTE_MAIN, ROUTE_MAINTAIN_MEMBERS, ROUTE_UPDATE_PASSWORD } from 'global/const'
import { tokenVar, userGroupsVar, userIdVar } from 'global/var'
import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Language } from 'translations/language'
import { T } from 'translations/translate'
import { CORE_GROUP } from 'common/core-groups'

import './side-menu.scss'
import { ExpandStateEnum } from 'global/types'

export const SideMenu = () => {
    const client = useApolloClient()
    const history = useHistory()
    const [expandState, setExpandState] = useState<ExpandStateEnum>(ExpandStateEnum.Collapsed)
    const userGroups = userGroupsVar()

    const onExpand = () => {
        setExpandState(ExpandStateEnum.Expanded)
    }

    const onCollapse = () => {
        setExpandState(ExpandStateEnum.Collapsed)
    }

    const onLogout = () => {
        history.push(ROUTE_LOGIN)
        client.cache.reset()
        tokenVar('')
        userIdVar('')
        userGroupsVar([])
    }

    return (
        <div className={"side-menu " + (ExpandStateEnum[expandState])}>
            <div className="overlay" onClick={onCollapse} />
            <div className="expand-toggle" onClick={expandState === ExpandStateEnum.Collapsed ? onExpand : onCollapse} />
            <div className="menu-content">
                <Link to={ROUTE_MAIN} onClick={onCollapse}><T k="menu:main" /></Link>
                <Link to={ROUTE_UPDATE_PASSWORD} onClick={onCollapse}><T k="menu:update-password" /></Link>
                {userGroups.find(group => group === CORE_GROUP.Admin) && <Link to={ROUTE_MAINTAIN_MEMBERS} onClick={onCollapse}><T k="menu:maintain-members" /></Link>}
                <Language />
                <T k="menu:logout" onClick={onLogout} />
            </div>
        </div>
    )
}