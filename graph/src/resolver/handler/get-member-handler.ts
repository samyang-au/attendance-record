import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";

export const getMemberHandler = async (memberId: string, context: TContext) =>
    context.pool.query(`
        SELECT *
        FROM ${STORED_PROC.getMember}(${memberId})
    `).then(result => result.rows[0] || {})