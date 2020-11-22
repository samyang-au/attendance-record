/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Gender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: maintainMembersDetailQuery
// ====================================================

export interface maintainMembersDetailQuery_member_member_type {
  __typename: "MemberType";
  id: string;
  name: string;
}

export interface maintainMembersDetailQuery_member_groups {
  __typename: "Group";
  id: string;
  name: string | null;
}

export interface maintainMembersDetailQuery_member {
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
  member_type: maintainMembersDetailQuery_member_member_type | null;
  inactive: boolean | null;
  notes: string | null;
  groups: (maintainMembersDetailQuery_member_groups | null)[] | null;
}

export interface maintainMembersDetailQuery_memberTypes {
  __typename: "MemberType";
  id: string;
  name: string;
}

export interface maintainMembersDetailQuery {
  member: maintainMembersDetailQuery_member | null;
  memberTypes: maintainMembersDetailQuery_memberTypes[];
}

export interface maintainMembersDetailQueryVariables {
  id: string;
}
