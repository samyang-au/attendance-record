import { TContext } from "../../app"
import { checkAuthorization } from "../authorization"

describe('authorization', () => {
    it('should throw error if context user is undefined', () => {
        expect(() => checkAuthorization({} as TContext)).toThrow('Unauthorized')
    })

    it('should not error if context user is defined', () => {
        expect(() => checkAuthorization({ user: {} } as TContext)).not.toThrow()
    })
})