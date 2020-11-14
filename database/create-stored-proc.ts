import { Client } from "pg";
import { SCHEMA, STORED_PROC } from "../common/database-constants";
import { securityDefinerRole } from "./create-express-user";

export async function createStoredProc(dbClient: Client) {
    const createProc = async (storedProcName: keyof typeof STORED_PROC, params: string, returnBlock: string, bodyBlock: string) =>
        await dbClient.query(`
            CREATE FUNCTION ${STORED_PROC[storedProcName]}(${params})
                RETURNS ${returnBlock}
                LANGUAGE 'plpgsql'
                SECURITY DEFINER

                SET search_path="${SCHEMA}"
            AS $BODY$
            BEGIN
                ${bodyBlock}
            END;
            $BODY$;

            ALTER FUNCTION ${STORED_PROC[storedProcName]}(${params.split(',').map(token => token.substr(token.lastIndexOf('"') + 1))
            })
                OWNER TO ${securityDefinerRole};
        `)

    await createProc(
        'getUserLogin',
        'IN "userName" character varying',
        `
            TABLE(
                id smallint,
                password_hash text,
                password_reset_required boolean
            )
        `,
        `
            RETURN QUERY
            SELECT m.id, m.password_hash, m.password_reset_required
            FROM "${SCHEMA}"."member" m
            WHERE m.user_name = "userName";
        `
    )

    await createProc(
        'getUserGroup',
        'IN "userId" int',
        `
            TABLE(
                name varchar(30)
            )
        `,
        `
            RETURN QUERY
            SELECT g.name
            FROM "attendance-record"."group_member" gm
                LEFT JOIN "attendance-record"."group" g ON gm.group_id = g.id
            WHERE gm.member_id = "userId"
                AND gm.end_date IS NULL
                AND g.end_date IS NULL
                AND g.parent_id IS NULL;
        `
    )

    await createProc(
        'updatePassword',
        'IN "userId" int, IN "passwordHash" text',
        `
            VOID
        `,
        `
            UPDATE "${SCHEMA}"."member"
            SET password_hash = "passwordHash", password_reset_required = false
            WHERE id = "userId";
        `,
    )

    await createProc(
        'getMember',
        'IN "memberId" int',
        `
            TABLE(
                id smallint,
                english_given_name text,
                english_surname text,
                chinese_given_name text,
                chinese_surname text,
                alias text,
                email text,
                user_name varchar(50),
                gender character(1),
                member_type_id smallint,
                address_id smallint,
                inactive boolean,
                notes text
            )
        `,
        `
            RETURN QUERY
            SELECT
                m.id,
                m.english_given_name,
                m.english_surname,
                m.chinese_given_name,
                m.chinese_surname,
                m.alias,
                m.email,
                m.user_name,
                m.gender,
                m.member_type_id,
                m.address_id,
                m.inactive,
                m.notes
            FROM "${SCHEMA}"."member" m
            WHERE m.id = "memberId";
        `,
    )

    await createProc(
        'getMembers',
        '',
        `
            TABLE(
                id smallint,
                english_given_name text,
                english_surname text,
                chinese_given_name text,
                chinese_surname text,
                alias text,
                email text,
                user_name varchar(50),
                gender character(1),
                member_type_id smallint,
                address_id smallint,
                inactive boolean,
                notes text
            )
        `,
        `
            RETURN QUERY
            SELECT
                m.id,
                m.english_given_name,
                m.english_surname,
                m.chinese_given_name,
                m.chinese_surname,
                m.alias,
                m.email,
                m.user_name,
                m.gender,
                m.member_type_id,
                m.address_id,
                m.inactive,
                m.notes
            FROM "${SCHEMA}"."member" m
            WHERE m.deceased = false;
        `,
    )

    await createProc(
        'getMemberType',
        'IN "memberTypeId" int',
        `
            TABLE(
                id smallint,
                name varchar(20)
            )
        `,
        `
            RETURN QUERY
            SELECT
                mt.id,
                mt.name
            FROM "${SCHEMA}"."member_type" mt
            WHERE mt.id = "memberTypeId";
        `,
    )
}