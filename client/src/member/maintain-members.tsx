import { gql, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { SearchMembersList } from './search-members-list'
import { membersQuery } from './__generated__/membersQuery'

import './maintain-members.scss'

const MEMBERS_QUERY = gql`
    query membersQuery {
        members {
            id
            english_given_name
            english_surname
            chinese_given_name
            chinese_surname
            alias
            email
            inactive
            notes
            groups {
                id
                name
            }
        }
    }
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