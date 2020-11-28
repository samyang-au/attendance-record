import { CORE_GROUP } from "../../../../common/core-groups";
import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";
import { checkAuthorization } from "../../auth/authorization";
import { getMemberHandler } from "../handler/get-member-handler";

export default {
    Query: {
        members: async (parent, args, context: TContext, info) =>
            checkAuthorization(context, CORE_GROUP.Admin) &&
            await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMembers}()
            `).then(result => result.rows || []),
        member: async (parent, args: { id: string }, context: TContext, info) =>
            checkAuthorization(context) &&
            await getMemberHandler(args.id, context)
    }
}