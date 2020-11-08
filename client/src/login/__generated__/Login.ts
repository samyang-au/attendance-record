/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: Login
// ====================================================

export interface Login_login {
  __typename: "Login";
  token: string | null;
  passwordResetRequired: boolean | null;
}

export interface Login {
  login: Login_login | null;
}

export interface LoginVariables {
  username: string;
  password: string;
}
