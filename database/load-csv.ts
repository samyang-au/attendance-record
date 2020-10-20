export type LocalCache<T = number> = { [K: string]: T }

export function loadCsv(line: string) {
    let result: string[] = []
    const tokens = line.split(',')
    let index = 0

    while (index < tokens.length) {
        if (!tokens[index].startsWith('"')) {
            result.push(sanitizeForDB(tokens[index]))
        } else {
            let token = tokens[index].substr(1)
            index++

            while (!tokens[index].endsWith('"')) {
                token += tokens[index]
                index++
            }

            token += tokens[index].substr(0, tokens[index].length - 1)
            result.push(sanitizeForDB(token))
        }
        index++
    }

    return result
}

const sanitizeForDB = (value: string) => value.replace("'", "''")
