import { gql, useMutation, useQuery } from '@apollo/client'
import { CORE_GROUP } from 'common/core-groups'
import React, { useState } from 'react'
import { t, T, TranslationKey } from 'translations/translate'
import { Gender, MemberInput } from '../../__generated__/globalTypes'
import { maintainMembersDetailMutation, maintainMembersDetailMutationVariables } from './__generated__/maintainMembersDetailMutation'
import { maintainMembersDetailQuery, maintainMembersDetailQueryVariables } from './__generated__/maintainMembersDetailQuery'
import { resetPasswordMutation, resetPasswordMutationVariables } from './__generated__/resetPasswordMutation'

import './maintain-members-detail.scss'

const MAINTAIN_MEMBERS_DETAIL_FRAGMENT = gql`
    fragment maintainMembersDetailFragment on Member {
        id
        english_given_name
        english_surname
        chinese_surname
        chinese_given_name
        alias
        email
        user_name
        gender
        member_type {
            id
            name
        }
        inactive
        notes
        security_groups {
            id
            name
        }
    }
`

const MAINTAIN_MEMBERS_DETAIL_QUERY = gql`
    query maintainMembersDetailQuery($id: ID!) {
        member(id: $id) {
            ...maintainMembersDetailFragment
        }
        memberTypes {
            id
            name
        }
    }
    ${MAINTAIN_MEMBERS_DETAIL_FRAGMENT}
`

const MAINTAIN_MEMBERS_DETAIL_MUTATION = gql`
    mutation maintainMembersDetailMutation($id: ID!, $input: MemberInput!) {
        updateMember(id: $id, input: $input) {
            ...maintainMembersDetailFragment
        }
    }
    ${MAINTAIN_MEMBERS_DETAIL_FRAGMENT}
`

const RESET_PASSWORD_MUTATION = gql`
    mutation resetPasswordMutation($userName: String!, $password: String!) {
        resetPassword(userName: $userName, password: $password)
    }
`

export const MaintainMembersDetail = ({ id }: { id: string }) => {
    const { data, loading } = useQuery<maintainMembersDetailQuery, maintainMembersDetailQueryVariables>(MAINTAIN_MEMBERS_DETAIL_QUERY, {
        variables: { id },
        fetchPolicy: 'network-only'
    })
    const [updateMember] = useMutation<maintainMembersDetailMutation, maintainMembersDetailMutationVariables>(MAINTAIN_MEMBERS_DETAIL_MUTATION)
    const [resetPassword] = useMutation<resetPasswordMutation, resetPasswordMutationVariables>(RESET_PASSWORD_MUTATION)
    const [memberDetail, setMemberDetail] = useState<MemberInput>()
    const [adminGroup, setAdminGroup] = useState(false)
    const [usherGroup, setUsherGroup] = useState(false)
    const [changed, setChanged] = useState(false)
    const [resettedPassword, setResettedPassword] = useState<string | null>(null)

    if (loading) {
        return <div className="loader" />
    }

    const resetState = () => {
        const memberInput: MemberInput = {
            english_given_name: data?.member?.english_given_name || '',
            english_surname: data?.member?.english_surname || '',
            chinese_given_name: data?.member?.chinese_given_name || '',
            chinese_surname: data?.member?.chinese_surname || '',
            alias: data?.member?.alias || '',
            email: data?.member?.email || '',
            user_name: data?.member?.user_name || '',
            gender: data?.member?.gender || Gender.M,
            member_type: data?.member?.member_type?.id || '',
            inactive: data?.member?.inactive || false,
            notes: data?.member?.notes || '',
            security_groups: [],
        }

        setMemberDetail(memberInput)
        if (data?.member?.security_groups?.find(group => group?.name === CORE_GROUP.Admin)) {
            setAdminGroup(true)
        } else {
            setAdminGroup(false)
        }
        if (data?.member?.security_groups?.find(group => group?.name === CORE_GROUP.Usher)) {
            setUsherGroup(true)
        } else {
            setUsherGroup(false)
        }
        setChanged(false)
    }

    if (memberDetail === undefined) {
        resetState()
    }

    const onEnglishGivenNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            english_given_name: e.target.value
        })
        setChanged(true)
    }
    const onEnglishSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            english_surname: e.target.value
        })
        setChanged(true)
    }
    const onChineseSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            chinese_surname: e.target.value
        })
        setChanged(true)
    }
    const onChineseGivenNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            chinese_given_name: e.target.value
        })
        setChanged(true)
    }
    const onAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            alias: e.target.value
        })
        setChanged(true)
    }
    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            email: e.target.value
        })
        setChanged(true)
    }
    const onUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            user_name: e.target.value
        })
        setChanged(true)
    }
    const onGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMemberDetail({
            ...memberDetail!,
            gender: e.target.value === 'M' ? Gender.M : Gender.F
        })
        setChanged(true)
    }
    const onMemberTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMemberDetail({
            ...memberDetail!,
            member_type: e.target.value
        })
        setChanged(true)
    }
    const onInactiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberDetail({
            ...memberDetail!,
            inactive: e.target.checked
        })
        setChanged(true)
    }
    const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMemberDetail({
            ...memberDetail!,
            notes: e.target.value
        })
        setChanged(true)
    }

    const onAdminGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminGroup(e.target.checked)
        setChanged(true)
    }

    const onUsherGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsherGroup(e.target.checked)
        setChanged(true)
    }

    const onCancel = () => {
        resetState()
    }

    const onSave = () => {
        const security_groups = []
        if (adminGroup) {
            security_groups.push(CORE_GROUP.Admin)
        }
        if (usherGroup) {
            security_groups.push(CORE_GROUP.Usher)
        }
        updateMember({
            variables: {
                id,
                input: {
                    ...memberDetail!,
                    security_groups
                }
            }
        })
        setChanged(false)
    }

    const onResetPassword = () => {
        const password = `Password${[1, 2, 3, 4].map(() => Math.floor(Math.random() * 10)).join('')}!`
        setResettedPassword(password)
        resetPassword({
            variables: {
                userName: memberDetail!.user_name,
                password
            }
        })
    }

    return (
        <div className="maintain-members-detail">
            <div className="fields">
                <T className="english-given-name-label" k="member-detail:english-given-name" />
                <input className="english-given-name-input" value={memberDetail?.english_given_name || ''} onChange={onEnglishGivenNameChange} />
                <T className="english-surname-label" k="member-detail:english-surname" />
                <input className="english-surname-input" value={memberDetail?.english_surname || ''} onChange={onEnglishSurnameChange} />
                <T className="chinese-surname-label" k="member-detail:chinese-surname" />
                <input className="chinese-surname-input" value={memberDetail?.chinese_surname || ''} onChange={onChineseSurnameChange} />
                <T className="chinese-given-name-label" k="member-detail:chinese-given-name" />
                <input className="chinese-given-name-input" value={memberDetail?.chinese_given_name || ''} onChange={onChineseGivenNameChange} />
                <T className="alias-label" k="member-detail:alias" />
                <input className="alias-input" value={memberDetail?.alias || ''} onChange={onAliasChange} />
                <T className="email-label" k="member-detail:email" />
                <input className="email-input" value={memberDetail?.email || ''} onChange={onEmailChange} />
                <T className="user-name-label" k="member-detail:user-name" />
                <input disabled className="user-name-input" value={memberDetail?.user_name || ''} onChange={onUserNameChange} />
                <T className="gender" k="member-detail:gender" />
                <select onChange={onGenderChange} value={memberDetail?.gender!}>
                    <option value="M">{t('gender:male')}</option>
                    <option value="F">{t('gender:female')}</option>
                </select>
                <T className="gender" k="member-detail:member-type" />
                <select onChange={onMemberTypeChange} value={memberDetail?.member_type}>
                    {
                        data?.memberTypes?.map(memberType => (
                            <option key={memberType.id} value={memberType.id}>{t(('member-detail:' + memberType.name) as TranslationKey)}</option>
                        ))
                    }
                </select>
                <T className="inactive-label" k="member-detail:inactive" />
                <input type="checkbox" className="inactive-checkbox" checked={memberDetail?.inactive || false} onChange={onInactiveChange} />
                <T className="notes-label" k="member-detail:notes" />
                <textarea className="notes-input" value={memberDetail?.notes || ''} onChange={onNotesChange} />
                <T className="notes-label" k="member-detail:groups" />
                <div className="groups-container">
                    <input type="checkbox" id={`admin-group-${data?.member?.id}`} name={`admin-group-${data?.member?.id}`} checked={adminGroup} onChange={onAdminGroupChange} />
                    <label htmlFor={`admin-group-${data?.member?.id}`}>
                        <T k="groups:admin" />
                    </label>
                    <input type="checkbox" id={`usher-group-${data?.member?.id}`} name={`usher-group-${data?.member?.id}`} checked={usherGroup} onChange={onUsherGroupChange} />
                    <label htmlFor={`usher-group-${data?.member?.id}`}>
                        <T k="groups:usher" />
                    </label>
                </div>
            </div>
            <div className="button-container">
                <button disabled={!changed} className="cancel-button" onClick={onCancel}><T k="member-detail:cancel-button" /></button>
                <button disabled={!changed} className="save-button" onClick={onSave}><T k="member-detail:save-button" /></button>
            </div>
            <div className="reset-password-container">
                <button className="reset-password-button" onClick={onResetPassword}><T k="member-detail:reset-password-button" /></button>
                {resettedPassword}
            </div>
        </div>
    )
}