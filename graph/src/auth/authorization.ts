import { ApolloError } from "apollo-server-express";
import { CORE_GROUP } from "../../../common/core-groups";
import { TContext } from "../app";

export const Unauthorized = new ApolloError('Unauthorized', '403')

export const checkAuthorization = (context: TContext, group?: keyof typeof CORE_GROUP) => {
    if (context.user === undefined || group && context.user.groups.findIndex(g => g === group) < 0) {
        throw Unauthorized
    }

    return true
}