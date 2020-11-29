/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Gender } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: maintainMembersDetailFragment
// ====================================================

export interface maintainMembersDetailFragment_member_type {
  __typename: "MemberType";
  id: string;
  name: string;
}

export interface maintainMembersDetailFragment_security_groups {
  __typename: "Group";
  id: string;
  name: string | null;
}

export interface maintainMembersDetailFragment {
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
  member_type: maintainMembersDetailFragment_member_type | null;
  inactive: boolean | null;
  notes: string | null;
  security_groups: (maintainMembersDetailFragment_security_groups | null)[];
}
