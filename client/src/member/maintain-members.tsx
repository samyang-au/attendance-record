import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { MEMBERS_SEARCH_FRAGMENT, SearchMembersList } from './search-members-list'
import { membersQuery } from './__generated__/membersQuery'
import { MaintainMembersDetail } from './maintain-members-detail'
import { CORE_GROUP } from 'common/core-groups'
import { userGroupsVar } from 'global/var'

import './maintain-members.scss'
import { AccessDenied } from 'authentication/access-denied'

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
    const userGroups = userGroupsVar()

    if (loading) {
        return <div className="loader" />
    }

    if (userGroups.find(group => group === CORE_GROUP.Admin)) {
        return <AccessDenied />
    }

    return (
        <div className="maintain-members">
            <SearchMembersList itemRenderer={MaintainMembersDetail} />
        </div>
    )
}
