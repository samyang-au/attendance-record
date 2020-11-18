/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: searchMemberQuery
// ====================================================

export interface searchMemberQuery_members {
  __typename: "Member";
  id: string;
  english_given_name: string;
  english_surname: string;
  chinese_given_name: string;
  chinese_surname: string;
  /**
   * address: Address
   */
  inactive: boolean | null;
}

export interface searchMemberQuery {
  members: searchMemberQuery_members[];
}
