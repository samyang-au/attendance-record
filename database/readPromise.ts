import * as read from 'read'

export function readPromise(options: read.Options): Promise<string> {
    return new Promise((resolve, reject) => {
        read(options, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}
