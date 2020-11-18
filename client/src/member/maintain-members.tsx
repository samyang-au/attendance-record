import { gql, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { MEMBERS_SEARCH_FRAGMENT, SearchMembersList } from './search-members-list'
import { membersQuery } from './__generated__/membersQuery'

import './maintain-members.scss'

const MEMBERS_QUERY = gql`
    query membersQuery {
        members {
            id
            ...searchMembersFragment
        }
    }
    ${MEMBERS_SEARCH_FRAGMENT}
`

export const MaintainMembers = () => {
    const { loading } = useQuery<membersQuery>(MEMBERS_QUERY)

    if (loading) {
        return <div className="loader" />
    }

    return (
        <div className="maintain-members">
            <SearchMembersList itemRenderer={Test} />
        </div>
    )
}

const Test = ({ id }: { id: string }) => {
    const [t, setT] = useState(0)

    return <div key={id} onClick={() => setT(t + 1)}>{id + t}</div>
}