import * as fs from 'fs'
import { LocalCache, loadCsv } from './load-csv';
import * as faker from 'faker'

const lineByLine = require('n-readlines')
const prodPath = './member.prod.csv'

if (fs.existsSync(prodPath)) {
    const liner = new lineByLine(prodPath)
    let line: Buffer | false;
    let columns: LocalCache
    let addresses: LocalCache<{ street: string, suburb: string, postcode: string }> = {}
    let result = ''
    let index = 0

    while (line = liner.next()) {
        let lineString = line.toString()
        lineString = lineString.substr(0, lineString.length - 1)
        if (columns === undefined) {
            lineString = lineString.substr(1)
            columns = {}
            lineString.split(',').forEach((c, i) => {
                columns[c] = i
            })
            result += lineString + '\n'
        } else {
            const values = loadCsv(lineString)
            values[columns['FirstName']] = faker.name.firstName()
            values[columns['LastName']] = faker.name.lastName()
            if (values[columns['Alias']]) {
                values[columns['Alias']] = faker.name.firstName()
            }
            if (values[columns['ChineseFirstName']]) {
                values[columns['ChineseFirstName']] = '名' + index
            }
            values[columns['Gender']] = ['M', 'F'][Math.floor(Math.random() * 2)]

            const addressKey = `${values[columns['LocalHomeAddress']]}:${values[columns['LocalCityOrSuburb']]}:${values[columns['LocalStateOrProvince']]}:${values[columns['LocalPostalCode']]}`
            if (!addresses[addressKey]) {
                addresses[addressKey] = {
                    street: faker.address.streetName(),
                    suburb: faker.address.city(),
                    postcode: faker.address.zipCode().substr(0, 4)
                }
            }
            values[columns['LocalHomeAddress']] = addresses[addressKey].street
            values[columns['LocalCityOrSuburb']] = addresses[addressKey].suburb
            values[columns['LocalStateOrProvince']] = 'QLD'
            values[columns['LocalPostalCode']] = addresses[addressKey].postcode
            if (values[columns['LocalPhoneNumber']]) {
                values[columns['LocalPhoneNumber']] = 'xxxxxxxxxx'
            }
            if (values[columns['MobilePhone']]) {
                values[columns['MobilePhone']] = 'xxxxxxxxxx'
            }
            if (values[columns['TJCEmail']]) {
                values[columns['TJCEmail']] = faker.internet.email()
            }
            if (values[columns['EmailAddress']]) {
                values[columns['EmailAddress']] = faker.internet.email()
            }
            const date = faker.date.past(80)
            values[columns['Birthdate']] = `${date.getDate()}/${date.getMonth()}/${date.getFullYear() % 100}`
            values[columns['DeceasedOrMovedDate']] = ''

            result += values.join(',') + '\n'
        }
        index++
    }

    fs.writeFileSync('./member.dev.csv', result)
} else {
    console.log(`Cannot find file: ${prodPath}`)
}