import { gql, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { firstBy } from 'thenby'
import { t, T } from 'translations/translate'
import { SearchMembersItem, SEARCH_MEMBERS_ITEM_FRAGMENT } from './search-members-item'

import './search-members-list.scss'
import { searchMemberQuery } from './__generated__/searchMemberQuery'

export const MEMBERS_SEARCH_FRAGMENT = gql`
    fragment searchMembersFragment on Member {
        id
        english_given_name
        english_surname
        chinese_given_name
        chinese_surname
        inactive
        ...searchMembersItemFragment
    }
    ${SEARCH_MEMBERS_ITEM_FRAGMENT}
`

const MEMBERS_SEARCH_QUERY = gql`
    query searchMemberQuery {
        members {
            ...searchMembersFragment
        }
    }
    ${MEMBERS_SEARCH_FRAGMENT}
`

type TLowerCaseMemberNames = searchMemberQuery['members'][number] & {
    lower_case_english_given_name: string
    lower_case_english_surname: string
}

export const SearchMembersList = ({ itemRenderer }: { itemRenderer: (props: { id: string }) => (JSX.Element | null) }) => {
    const { loading, data } = useQuery<searchMemberQuery>(MEMBERS_SEARCH_QUERY)
    const [searchString, setSearchString] = useState('')
    const [includeInactive, setIncludeInactive] = useState(false)

    if (loading) {
        return <div className="loader" />
    }

    const onSearchStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchString(e.target.value.toLowerCase())
    }

    const searchData = data?.members.map(member => ({
        ...member,
        lower_case_english_given_name: member.english_given_name.toLowerCase(),
        lower_case_english_surname: member.english_surname.toLowerCase(),
    })).filter(
        member => (includeInactive || member.inactive === false)
            && `${member.lower_case_english_given_name} ${member.lower_case_english_surname} ${member.chinese_surname}${member.chinese_given_name}`
                .indexOf(searchString) > -1
    ).sort(
        firstBy<TLowerCaseMemberNames, boolean>(member => !member.lower_case_english_given_name.startsWith(searchString))
            .thenBy<TLowerCaseMemberNames, boolean>(member => !member.lower_case_english_surname.startsWith(searchString))
            .thenBy<TLowerCaseMemberNames, boolean>(member => !member.chinese_given_name.startsWith(searchString))
            .thenBy<TLowerCaseMemberNames, boolean>(member => !member.chinese_surname.startsWith(searchString))
            .thenBy<TLowerCaseMemberNames, string>(member => member.lower_case_english_given_name)
            .thenBy<TLowerCaseMemberNames, string>(member => member.lower_case_english_surname)
            .thenBy<TLowerCaseMemberNames, string>(member => member.chinese_given_name)
            .thenBy<TLowerCaseMemberNames, string>(member => member.chinese_surname)
    )

    const toggleIncludeInactive = () => {
        setIncludeInactive(!includeInactive)
    }

    return (
        <div className="search-members">
            <div className="search-container-background">
                <div className="search-container">
                    <div className="include-inactive-container">
                        <label htmlFor="include-inactive" className="include-inactive-label"><T k="search-members:include-inactive" /></label>
                        <input type="checkbox" id="include-inactive" name="include-inactive" checked={includeInactive} onChange={toggleIncludeInactive} />
                    </div>
                    <input value={searchString} onChange={onSearchStringChange} autoCapitalize="none" autoCorrect="off" placeholder={t('search-members:search-placeholder')} />
                </div>
            </div>
            <div className="search-members-items">
                {
                    searchData?.map(member => (
                        <SearchMembersItem key={member.id} id={member.id} itemRenderer={itemRenderer} />
                    ))
                }
            </div>
        </div>
    )
}