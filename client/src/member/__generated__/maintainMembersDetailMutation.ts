/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MemberInput, Gender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: maintainMembersDetailMutation
// ====================================================

export interface maintainMembersDetailMutation_updateMember_member_type {
  __typename: "MemberType";
  id: string;
  name: string;
}

export interface maintainMembersDetailMutation_updateMember_security_groups {
  __typename: "Group";
  id: string;
  name: string | null;
}

export interface maintainMembersDetailMutation_updateMember {
  __typename: "Member";
  id: string;
  english_given_name: string;
  english_surname: string;
  chinese_surname: string;
  chinese_given_name: string;
  alias: string;
  email: string | null;
  user_name: string | null;
  gender: Gender | null;
  member_type: maintainMembersDetailMutation_updateMember_member_type | null;
  inactive: boolean | null;
  notes: string | null;
  security_groups: (maintainMembersDetailMutation_updateMember_security_groups | null)[];
}

export interface maintainMembersDetailMutation {
  updateMember: maintainMembersDetailMutation_updateMember | null;
}

export interface maintainMembersDetailMutationVariables {
  id: string;
  input: MemberInput;
}
