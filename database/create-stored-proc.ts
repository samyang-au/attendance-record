import { Client } from "pg";
import { SCHEMA, STORED_PROC } from "../common/database-constants";
import { securityDefinerRole } from "./create-express-user";

const RETURN_MEMBER_DATA = `
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
`
const MEMBER_COLUMNS = `
    m.id,
    COALESCE (m.english_given_name, ''),
    COALESCE (m.english_surname, ''),
    COALESCE (m.chinese_given_name, ''),
    COALESCE (m.chinese_surname, ''),
    COALESCE (m.alias, ''),
    m.email,
    m.user_name,
    m.gender,
    m.member_type_id,
    m.address_id,
    m.inactive,
    m.notes
`

export async function createStoredProc(dbClient: Client) {
    const createProc = async (storedProcName: keyof typeof STORED_PROC, params: string, returnBlock: string, bodyBlock: string) =>
        console.log(`create ${storedProcName}`) as unknown ||
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
        'IN "_user_name" character varying',
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
            WHERE m.user_name = "_user_name";
        `
    )

    await createProc(
        'getSecurityGroup',
        'IN "_member_id" int',
        `
            TABLE(
                id smallint,
                name varchar(30)
            )
        `,
        `
            RETURN QUERY
            SELECT g.id, g.name
            FROM "${SCHEMA}"."group_member" gm
                LEFT JOIN "${SCHEMA}"."group" g ON gm.group_id = g.id
            WHERE gm.member_id = "_member_id"
                AND gm.end_date IS NULL
                AND g.end_date IS NULL
                AND g.is_security_group = true;
        `
    )

    await createProc(
        'getFamily',
        'IN "_member_id" int',
        RETURN_MEMBER_DATA,
        `
            RETURN QUERY
            SELECT ${MEMBER_COLUMNS}
            FROM "${SCHEMA}"."group_member" gm
                LEFT JOIN "${SCHEMA}"."group" gf ON gf.id = gm.group_id
                LEFT JOIN "${SCHEMA}"."group" gfr ON gfr.id = gf.parent_id
                LEFT JOIN "${SCHEMA}"."group_member" gms ON gms.group_id = gf.id
                LEFT JOIN "${SCHEMA}"."member" m ON m.id = gms.member_id
            WHERE gm.member_id = "_member_id" AND gfr.name = 'Family'
            ORDER BY gms.order_id;
        `
    )

    await createProc(
        'getAttendanceGroup',
        'IN "_member_id" int',
        RETURN_MEMBER_DATA,
        `
            RETURN QUERY
            SELECT ${MEMBER_COLUMNS}
            FROM "${SCHEMA}"."group_member" gm
                LEFT JOIN "${SCHEMA}"."group" gf ON gf.id = gm.group_id
                LEFT JOIN "${SCHEMA}"."group" gfr ON gfr.id = gf.parent_id
                LEFT JOIN "${SCHEMA}"."group_member" gms ON gms.group_id = gf.id
                LEFT JOIN "${SCHEMA}"."member" m ON m.id = gms.member_id
            WHERE gm.member_id = "_member_id"
                AND gfr.name = 'AttendanceGrouping'
                AND m.id NOT IN (
                    SELECT f.id
                    FROM "${SCHEMA}"."getFamily"("_member_id") f
                );
        `
    )

    await createProc(
        'insertMemberGroup',
        'IN "_group_name" character varying, IN "_member_id" int, OUT ret_id int',
        `
            int
        `,
        `
            INSERT INTO "${SCHEMA}"."group_member" (group_id, member_id, start_date)
            SELECT g.id, "_member_id", NOW()
            FROM "${SCHEMA}"."group" g
            WHERE g.name = "_group_name"
            RETURNING id INTO ret_id;
        `
    )

    await createProc(
        'deleteMemberGroup',
        'IN "_group_id" int, IN "_member_id" int',
        `
            VOID
        `,
        `
            DELETE FROM "${SCHEMA}"."group_member"
            WHERE group_id = "_group_id" AND member_id = "_member_id";
        `
    )

    await createProc(
        'updatePassword',
        'IN "_user_id" int, IN "_password_hash" text',
        `
            VOID
        `,
        `
            UPDATE "${SCHEMA}"."member"
            SET password_hash = "_password_hash", password_reset_required = false
            WHERE id = "_user_id";
        `,
    )

    await createProc(
        'resetPassword',
        'IN "_user_name" character varying, IN "_password_hash" text',
        `
            VOID
        `,
        `
            UPDATE "${SCHEMA}"."member"
            SET password_hash = "_password_hash", password_reset_required = true
            WHERE user_name = "_user_name";
        `,
    )

    await createProc(
        'getMember',
        'IN "_member_id" int',
        RETURN_MEMBER_DATA,
        `
            RETURN QUERY
            SELECT ${MEMBER_COLUMNS}
            FROM "${SCHEMA}"."member" m
            WHERE m.id = "_member_id";
        `,
    )

    await createProc(
        'getMembers',
        '',
        RETURN_MEMBER_DATA,
        `
            RETURN QUERY
            SELECT ${MEMBER_COLUMNS}
            FROM "${SCHEMA}"."member" m
            WHERE m.deceased = false;
        `,
    )

    await createProc(
        'getMemberType',
        'IN "_member_type_id" int',
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
            WHERE mt.id = "_member_type_id";
        `,
    )

    await createProc(
        'getMemberTypes',
        '',
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
            FROM "${SCHEMA}"."member_type" mt;
        `,
    )

    await createProc(
        'updateMember',
        `
            IN "_user_id" int,
            IN "_english_given_name" text,
            IN "_english_surname" text,
            IN "_chinese_given_name" text,
            IN "_chinese_surname" text,
            IN "_alias" text,
            IN "_email" text,
            IN "_user_name" varchar(50),
            IN "_gender" character(1),
            IN "_member_type_id" smallint,
            IN "_inactive" boolean,
            IN "_notes" text
        `,
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
                inactive boolean,
                notes text
            )
        `,
        `
            RETURN QUERY
            UPDATE "${SCHEMA}"."member" m
            SET
                english_given_name = "_english_given_name",
                english_surname = "_english_surname",
                chinese_given_name = "_chinese_given_name",
                chinese_surname = "_chinese_surname",
                alias = "_alias",
                email = "_email",
                user_name = "_user_name",
                gender = "_gender",
                member_type_id = "_member_type_id",
                inactive = "_inactive",
                notes = "_notes"
            WHERE m.id = "_user_id"
            RETURNING
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
                m.inactive,
                m.notes;
        `,
    )

    await createProc(
        'getGroup',
        `
            IN "_group_id" int
        `,
        `
            TABLE(
                id smallint,
                name varchar(30),
                start_date date,
                end_date date,
                parent_id smallint,
                order_id smallint
            )
        `,
        `
            RETURN QUERY
            SELECT
                g.id,
                g.name,
                g.start_date,
                g.end_date,
                g.parent_id,
                g.order_id
            FROM "${SCHEMA}"."group" g
            WHERE g.id = "_group_id";
        `
    )

    await createProc(
        'getGroupMembers',
        `
            IN "_group_id" int
        `,
        `
            TABLE(
                id smallint,
                group_id smallint,
                member_id smallint,
                start_date date,
                end_date date,
                order_id smallint
            )
        `,
        `
            RETURN QUERY
            SELECT
                gm.id,
                gm.group_id,
                gm.member_id,
                gm.start_date,
                gm.end_date,
                gm.order_id
            FROM "${SCHEMA}"."group_member" gm
            WHERE gm.group_id = "_group_id";
        `
    )
}