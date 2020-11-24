import { ApolloError } from "apollo-server-express";
import { PoolClient } from "pg";
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

            let client: PoolClient
            let result = {}

            try {
                client = await context.pool.connect()

                // TODO: remove this once maintain groups is implemented
                const currentGroups: { id: string, name: string }[] = await client.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserGroup}(${id})
                `).then(result => result.rows || [])

                updateGroup(currentGroups, input.groups, 'Admin', id, client)
                updateGroup(currentGroups, input.groups, 'Usher', id, client)
                // END TODO

                result = await client.query(`
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
            } catch (e) {
                throw new ApolloError('Something went wrong, please try a gain later', 'error:generic')
            } finally {
                if(client) {
                    client.release()
                }
            }

            return result
        }
    }
}

const updateGroup = (currentGroups: {id: string, name: string}[], newGroups: string[], groupName: keyof typeof CORE_GROUP, user_id: string, client: PoolClient) => {
    const currentGroup = currentGroups.find(group => group.name === groupName)
    const existInNewGroup = newGroups.findIndex(group => group === groupName) > -1

    if(currentGroup && !existInNewGroup) {
        client.query(`
            SELECT *
            FROM ${STORED_PROC.deleteUserGroup}(${currentGroup.id}, ${user_id})
        `)
    } else if (!currentGroup && existInNewGroup) {
        client.query(`
            SELECT *
            FROM ${STORED_PROC.insertUserGroup}('${groupName}', ${user_id})
        `)
    }
}