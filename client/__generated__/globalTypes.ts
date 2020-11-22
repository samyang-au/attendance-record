/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum Gender {
  F = "F",
  M = "M",
}

export interface MemberInput {
  english_given_name: string;
  english_surname: string;
  chinese_given_name: string;
  chinese_surname: string;
  alias: string;
  email: string;
  user_name: string;
  gender: Gender;
  member_type: string;
  inactive: boolean;
  notes: string;
  groups: string[];
}

//==============================================================
// END Enums and Input Objects
//==============================================================
