import { Client } from "pg";
import { CORE_GROUP } from "../common/core-groups";
import { SCHEMA } from "../common/database-constants";
import * as fs from 'fs'
import { LocalCache, loadCsv } from "./load-csv";
import * as argon2 from 'argon2'

const lineByLine = require('n-readlines')

export async function seedDatabase(dbClient: Client) {
    console.log('seeding database')

    console.log('create member types')
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member_type" (name)
        VALUES ('Registered Member')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member_type" (name)
        VALUES ('Nonregistered Member')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member_type" (name)
        VALUES ('Visitor')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member_type" (name)
        VALUES ('Truth Seeker')
    `)

    console.log('create groups')
    const adminGroupId = await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.Admin}', '2020-1-1')
        RETURNING id
    `).then(result => result.rows[0].id)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.Committee}', '2020-1-1')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.RE}', '2020-1-1')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.CookingGroup}', '2020-1-1')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.Family}', '2020-1-1')
    `)
    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group" (group_name, start_date)
        VALUES ('${CORE_GROUP.ExtendedFamily}', '2020-1-1')
    `)

    console.log('creat admin user')
    const adminPasswordHash = await argon2.hash('admin')
    const adminId = await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member" (
            english_given_name,
            user_name,
            password_hash,
            password_reset_required,
            inactive
        ) VALUES (
            'Admin',
            'admin',
            '${adminPasswordHash}',
            true,
            true
        ) RETURNING id
    `).then(result => result.rows[0].id)

    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group_member" (
            group_id,
            member_id,
            start_date,
            order_id
        ) VALUES (
            ${adminGroupId},
            ${adminId},
            '2020-1-1',
            1
        )
    `)

    const env = process.env.env || 'dev'
    const memberFilePath = `./member.${env}.csv`
    if (fs.existsSync(memberFilePath)) {
        console.log('migrating ' + memberFilePath)

        const liner = new lineByLine(memberFilePath)
        let line: Buffer | false;
        let columns: LocalCache

        while (line = liner.next()) {
            let lineString = line.toString().replace('\r', '').replace('\n', '')
            if (columns === undefined) {
                columns = {}
                lineString.split(',').forEach((c, i) => {
                    columns[c] = i
                })
            } else {
                const values = loadCsv(lineString)
                const getValueFunc = generateGetValue(values, columns)

                const memberTypeId = mapOldMemberTypeIdToNewMemberTypeId(Number(values[columns['MemberTypeID']]))
                const addressId = await getAddressId(getValueFunc, dbClient)
                await createMember(getValueFunc, memberTypeId, addressId, dbClient)
            }
        }
    } else {
        throw `Missing ${memberFilePath}`
    }

    const familyFilePath = `./family.${env}.csv`
    if (fs.existsSync(familyFilePath)) {
        console.log('migrating ' + familyFilePath)

        const liner = new lineByLine(familyFilePath)
        let line: Buffer | false;
        let columns: LocalCache

        while (line = liner.next()) {
            let lineString = line.toString().replace('\r', '').replace('\n', '')
            if (columns === undefined) {
                lineString = lineString.substr(1)
                columns = {}
                lineString.split(',').forEach((c, i) => {
                    columns[c] = i
                })
            } else {
                const values = loadCsv(lineString)
                const getValueFunc = generateGetValue(values, columns)

                const rootFamilyId = await dbClient.query(`
                    SELECT id
                    FROM "${SCHEMA}"."group"
                    WHERE group_name='${CORE_GROUP.Family}'
                `).then(result => Number(result.rows[0].id))

                await createFamily(getValueFunc, rootFamilyId, dbClient)
            }
        }
    } else {
        throw `Missing ${familyFilePath}`
    }

    await createExtendedFamily(dbClient)
}

function mapOldMemberTypeIdToNewMemberTypeId(oldMemberTypeId: number) {
    switch (oldMemberTypeId) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            return 1
        case 2:
        case 10:
        case 13:
        case 16:
            return 2
        case 11:
        case 14:
            return 3
        case 8:
        case 9:
        case 12:
        case 15:
            return 4
    }
}

let addressIndex = 1
const addressIdTable: LocalCache = {}
async function getAddressId(getValue: GetValueFunc, dbClient: Client) {
    const street = getValue('LocalHomeAddress')
    const suburb = getValue('LocalCityOrSuburb')
    const state = getValue('LocalStateOrProvince')
    const postcode = getValue('LocalPostalCode')

    if (street === 'NULL' && suburb === 'NULL' && state === 'NULL' && postcode === 'NULL') {
        return 'NULL'
    }

    const addressKey = `${street}:${suburb}:${state}:${postcode}`

    let addressCache = addressIdTable[addressKey]

    if (addressCache === undefined) {
        console.log('insert address data')

        const t = await dbClient.query(`
            INSERT INTO "${SCHEMA}"."address" (street,suburb,state,postcode)
            VALUES (${street},${suburb},${state},${postcode})
        `)
        addressIdTable[addressKey] = addressIndex
        addressCache = addressIndex
        addressIndex++
    }

    return addressCache
}

async function createMember(getValue: GetValueFunc, memberTypeId: number, addressId: number | 'NULL', dbClient: Client) {
    console.log('insert member data')

    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."member" (
            english_given_name,
            english_surname,
            chinese_given_name,
            chinese_surname,
            alias,
            email,
            legacy_id,
            gender,
            member_type_id,
            address_id,
            inactive
        ) VALUES (
            ${getValue('FirstName')},
            ${getValue('LastName')},
            ${getValue('ChineseFirstName')},
            ${getValue('ChineseLastName')},
            ${getValue('Alias')},
            ${getValue('TJCEmail', 'EmailAddress')},
            ${getValue('MemberID')},
            ${getValue('Gender')},
            ${memberTypeId},
            ${addressId},
            ${getValue('DeceasedOrMovedDate') !== 'NULL' || getValue('Exclude_Directory').toUpperCase() === "'TRUE'"}
        )
    `)
}

type GetValueFunc = (columnName: string, columnName2?: string) => string
const generateGetValue = (values: string[], columns: LocalCache) => (columnName: string, columnName2?: string) => {
    let value = values[columns[columnName]]

    if (!value && columnName) {
        value = values[columns[columnName2]]
    }

    if (value) {
        return `'${value}'`
    }

    return 'NULL'
}

const familyCache: LocalCache = {}
async function createFamily(getValue: GetValueFunc, rootFamilyId: number, dbClient: Client) {
    const familyId = getValue('Family ID')

    if (!familyCache[familyId]) {
        familyCache[familyId] = await dbClient.query(`
            INSERT INTO "${SCHEMA}"."group" (
                start_date,
                parent_id
            ) VALUES (
                '2020-1-1',
                ${rootFamilyId}
            ) RETURNING id
        `).then(result => result.rows[0].id)
    }

    const memberId = await dbClient.query(`
        SELECT id
        FROM "${SCHEMA}"."member"
        WHERE legacy_id = ${getValue('Member ID').replace('-', '')}
    `).then(result => result.rows[0].id)

    await dbClient.query(`
        INSERT INTO "${SCHEMA}"."group_member" (
            group_id,
            member_id,
            start_date,
            order_id
        ) VALUES (
            ${familyCache[familyId]},
            ${memberId},
            '2020-1-1',
            ${getValue('Dependent ID')}
        )
    `)
}

async function createExtendedFamily(dbClient: Client) {
    console.log('create extended family based on address')

    const addressFamily = await dbClient.query<{ address_id: number, member_id: number, order_id: number }>(`
        SELECT m.address_id, m.id AS member_id, DENSE_RANK() OVER (PARTITION BY m.address_id ORDER BY m.address_id, m.id) AS order_id
        FROM
            (
                SELECT m.address_id, Count(DISTINCT g2.id)
                FROM "attendance-record".group g1
                    LEFT JOIN "attendance-record".group g2 ON g1.id = g2.parent_id
                    LEFT JOIN "attendance-record".group_member gm ON g2.id = gm.group_id
                    LEFT JOIN "attendance-record".member m ON gm.member_id = m.id AND m.inactive = false
                WHERE g1.group_name = 'Family' AND m.address_id IS NOT NULL
                GROUP BY m.address_id
                HAVING Count(DISTINCT g2.id) > 1
            ) extFam
            LEFT JOIN "attendance-record".member m ON m.address_id = extFam.address_id AND m.inactive = false
            LEFT JOIN "attendance-record".group_member gm ON m.id = gm.member_id
            LEFT JOIN "attendance-record".group g2 ON g2.id = gm.group_id
            LEFT JOIN "attendance-record".group g1 ON g2.parent_id = g1.id
        WHERE g1.group_name = 'Family'
        ORDER BY m.address_id, g2.id, gm.order_id
    `).then(result => result.rows)

    const rootExtendedFamilyId = await dbClient.query(`
        SELECT id
        FROM "${SCHEMA}"."group"
        WHERE group_name='${CORE_GROUP.ExtendedFamily}'
    `).then(result => Number(result.rows[0].id))

    let lastAddressId: number, extendedFamilyId: number

    for (let familyMember of addressFamily) {
        if (lastAddressId !== familyMember.address_id) {
            console.log('create extended family')

            lastAddressId = familyMember.address_id
            extendedFamilyId = await dbClient.query(`
                INSERT INTO "${SCHEMA}"."group" (
                    start_date,
                    parent_id
                ) VALUES (
                    '2020-1-1',
                    ${rootExtendedFamilyId}
                ) RETURNING id
            `).then(result => result.rows[0].id)
        }

        console.log('adding extended family member')
        await dbClient.query(`
            INSERT INTO "${SCHEMA}"."group_member" (
                group_id,
                member_id,
                start_date,
                order_id
            ) VALUES (
                ${extendedFamilyId},
                ${familyMember.member_id},
                '2020-1-1',
                ${familyMember.order_id}
            )
        `)
    }
}