import { gql, useApolloClient } from '@apollo/client'
import { ExpandStateEnum } from 'global/types'
import React, { useState } from 'react'
import { searchMembersItemFragment } from './__generated__/searchMembersItemFragment'

import './search-members-item.scss'

export const SEARCH_MEMBERS_ITEM_FRAGMENT = gql`
    fragment searchMembersItemFragment on Member {
        english_given_name
        english_surname
        chinese_given_name
        chinese_surname
    }
`

type TProps = {
    id: string,
    itemRenderer: (props: { id: string }) => JSX.Element
}

export const SearchMembersItem = ({ id, itemRenderer: ItemRenderer }: TProps) => {
    const client = useApolloClient()
    const [expandState, setExpandState] = useState<ExpandStateEnum>(ExpandStateEnum.Collapsed)
    const data = client.readFragment<searchMembersItemFragment>({
        id: 'Member:' + id,
        fragment: SEARCH_MEMBERS_ITEM_FRAGMENT
    })

    if (data == null) {
        return null
    }

    const onExpand = () => {
        setExpandState(ExpandStateEnum.Expanded)
    }

    const onCollapse = () => {
        setExpandState(ExpandStateEnum.Collapsed)
    }

    return (
        <div className={"search-members-item " + (ExpandStateEnum[expandState])}>
            <div className="border">
                <div className="title">
                    <div className="english-name">
                        {`${data.english_given_name} ${data.english_surname}`}
                    </div>
                    <div className="chinese-name">
                        {`${data.chinese_surname}${data.chinese_given_name}`}
                    </div>
                    <div className="expand-toggle" onClick={expandState === ExpandStateEnum.Collapsed ? onExpand : onCollapse} />
                </div>
                {expandState === ExpandStateEnum.Expanded &&
                    <div className="item-container">
                        <ItemRenderer id={id} />
                    </div>
                }
            </div>
        </div>
    )
}