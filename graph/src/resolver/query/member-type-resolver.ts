import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";
import { checkAuthorization } from "../../auth/authorization";

export default {
    Query: {
        memberTypes: async (parent, args, context: TContext, info) => 
            checkAuthorization(context) &&
            await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMemberTypes}()
            `).then(result => result.rows || [])
    }
}