import { ROUTE_SERVICE_RECORD } from 'global/const'
import React from 'react'
import { Link } from 'react-router-dom'
import { T } from 'translations/translate'

type Props = {
    onClick: () => void
}

export const ServiceRecordSubmenu = ({ onClick }: Props) => {
    const now = new Date()
    const date = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}-`
    now.setHours(17)
    now.setMinutes(0)

    if (now.getHours() < 12 || (now.getHours() === 12 && now.getMinutes() <= 30)) {
        return (
            <Link className="submenu" to={`${ROUTE_SERVICE_RECORD}/${date}morning`} onClick={onClick}>
                <T k="menu:service-records-submenu:morning-service" />
            </Link>
        )
    }

    if (now.getHours() < 18) {
        return (
            <>
                <Link className="submenu" to={`${ROUTE_SERVICE_RECORD}/${date}morning`} onClick={onClick}>
                    <T k="menu:service-records-submenu:morning-service" />
                </Link>
                <Link className="submenu" to={`${ROUTE_SERVICE_RECORD}/${date}afternoon`} onClick={onClick}>
                    <T k="menu:service-records-submenu:afternoon-service" />
                </Link>
            </>
        )
    }

    return (
        <Link className="submenu" to={`${ROUTE_SERVICE_RECORD}/${date}evening`} onClick={onClick}>
            <T k="menu:service-records-submenu:night-service" />
        </Link>
    )
}