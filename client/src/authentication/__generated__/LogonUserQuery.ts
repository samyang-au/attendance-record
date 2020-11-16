/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LogonUserQuery
// ====================================================

export interface LogonUserQuery_member_groups {
  __typename: "Group";
  id: string;
  name: string | null;
}

export interface LogonUserQuery_member {
  __typename: "Member";
  id: string;
  english_given_name: string;
  english_surname: string;
  chinese_given_name: string;
  chinese_surname: string;
  groups: (LogonUserQuery_member_groups | null)[] | null;
}

export interface LogonUserQuery {
  member: LogonUserQuery_member | null;
}

export interface LogonUserQueryVariables {
  id: string;
}
