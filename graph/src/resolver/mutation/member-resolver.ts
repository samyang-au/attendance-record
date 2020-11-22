import { CORE_GROUP } from "../../../../common/core-groups";
import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";
import { checkAuthorization } from "../../auth/authorization";

interface MemberInput {
    english_given_name: string;
    english_surname: string;
    chinese_given_name: string;
    chinese_surname: string;
    alias: string;
    email: string;
    user_name: string;
    gender: 'M' | 'F';
    member_type: string;
    inactive: boolean;
    notes: string;
    groups: string[];
}

export default {
    Mutation: {
        updateMember: async (parent, { id, input }: { id: string, input: MemberInput }, context: TContext, info) => {
            checkAuthorization(context)

            return await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.updateMember}(
                    '${id}',
                    '${input.english_given_name}',
                    '${input.english_surname}',
                    '${input.chinese_given_name}',
                    '${input.chinese_surname}',
                    '${input.alias}',
                    '${input.email}',
                    '${input.user_name}',
                    '${input.gender}',
                    '${input.member_type}',
                    ${input.inactive},
                    '${input.notes}'
                )
            `).then(result => result.rows[0])
        }
    }
}