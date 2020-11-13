import { ApolloError } from "apollo-server-express";
import { TContext } from "../app";

export const Unauthorized = new ApolloError('Unauthorized', '403')

export const checkAuthorization = (context: TContext) => {
    if (context.user === undefined) {
        throw Unauthorized
    }

    return true
}