/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: membersQuery
// ====================================================

export interface membersQuery_members_groups {
  __typename: "Group";
  id: string;
  name: string | null;
}

export interface membersQuery_members {
  __typename: "Member";
  id: string;
  english_given_name: string;
  english_surname: string;
  chinese_given_name: string;
  chinese_surname: string;
  alias: string;
  email: string | null;
  /**
   * address: Address
   */
  inactive: boolean | null;
  notes: string | null;
  groups: (membersQuery_members_groups | null)[] | null;
}

export interface membersQuery {
  members: membersQuery_members[];
}
