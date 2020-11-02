import { passwordComplexityCheck } from "../password-complexity"

describe('password-complexity', () => {
    it.each([undefined, null, ''])('should return all the broken rules', (value) => {
        const result = passwordComplexityCheck(value)
        expect(result.length).toBe(5)
        expect(result).toContain('password length should be >= 6')
        expect(result).toContain('password should contains at least 1 lower case letter')
        expect(result).toContain('password should contains at least 1 upper case letter')
        expect(result).toContain('password should contains at least 1 number')
        expect(result).toContain('password should contains at least 1 special characters')
    })

    it('should only return error for the conditions not met', () => {
        let result = passwordComplexityCheck('1')
        expect(result.length).toBe(4)
        expect(result).toContain('password length should be >= 6')
        expect(result).toContain('password should contains at least 1 lower case letter')
        expect(result).toContain('password should contains at least 1 upper case letter')
        expect(result).toContain('password should contains at least 1 special characters')

        result = passwordComplexityCheck('a')
        expect(result.length).toBe(4)
        expect(result).toContain('password length should be >= 6')
        expect(result).toContain('password should contains at least 1 upper case letter')
        expect(result).toContain('password should contains at least 1 number')
        expect(result).toContain('password should contains at least 1 special characters')

        result = passwordComplexityCheck('A')
        expect(result.length).toBe(4)
        expect(result).toContain('password length should be >= 6')
        expect(result).toContain('password should contains at least 1 lower case letter')
        expect(result).toContain('password should contains at least 1 number')
        expect(result).toContain('password should contains at least 1 special characters')

        result = passwordComplexityCheck('!')
        expect(result.length).toBe(4)
        expect(result).toContain('password length should be >= 6')
        expect(result).toContain('password should contains at least 1 lower case letter')
        expect(result).toContain('password should contains at least 1 upper case letter')
        expect(result).toContain('password should contains at least 1 number')

        result = passwordComplexityCheck('1111111')
        expect(result.length).toBe(3)
        expect(result).toContain('password should contains at least 1 lower case letter')
        expect(result).toContain('password should contains at least 1 upper case letter')
        expect(result).toContain('password should contains at least 1 special characters')
    })

    it('should return empty array if all conditions are met', () => {
        const result = passwordComplexityCheck('1aA!a2')
        expect(result.length).toBe(0)
    })
})