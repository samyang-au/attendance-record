import { sign, decode, verify } from "jws"
import { Unauthorized } from "./authorization"

const TIMEOUT = (Number(process.env.timeout) || 15) * 60000 // default to 15 min

export type TokenContent = {
    id: number,
    userName: string,
    groups: string[],
    expiry: number
}

export const createToken = (content: Omit<TokenContent, 'expiry'>) =>
    sign({
        header: { alg: 'HS256' },
        secret: process.env.secret,
        payload: {
            ...content,
            expiry: Date.now() + TIMEOUT
        },
    })

export const verifyAndDecode = (authHeader?: string): TokenContent | undefined => {
    if (authHeader) {
        if (verify(authHeader, 'HS256', process.env.secret)) {
            const content = JSON.parse(decode(authHeader).payload) as TokenContent

            if (content.expiry < Date.now()) {
                throw Unauthorized
            }

            return content
        } else {
            throw Unauthorized
        }
    }

    return undefined
}
