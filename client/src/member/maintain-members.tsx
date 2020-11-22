import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { MEMBERS_SEARCH_FRAGMENT, SearchMembersList } from './search-members-list'
import { membersQuery } from './__generated__/membersQuery'
import { MaintainMembersDetail } from './maintain-members-detail'

import './maintain-members.scss'

const MAINTAIN_MEMBERS_QUERY = gql`
    query membersQuery {
        members {
            id
            ...searchMembersFragment
        }
    }
    ${MEMBERS_SEARCH_FRAGMENT}
`

export const MaintainMembers = () => {
    const { loading } = useQuery<membersQuery>(MAINTAIN_MEMBERS_QUERY)

    if (loading) {
        return <div className="loader" />
    }

    return (
        <div className="maintain-members">
            <SearchMembersList itemRenderer={MaintainMembersDetail} />
        </div>
    )
}
