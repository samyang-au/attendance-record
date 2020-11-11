import { passwordComplexityCheck } from "../password-complexity"

describe('password-complexity', () => {
    it.each([undefined, null, ''])('should return all the broken rules', (value) => {
        const result = passwordComplexityCheck(value)
        expect(result.length).toBe(5)
        expect(result).toContain('password:error:length')
        expect(result).toContain('password:error:lowercase')
        expect(result).toContain('password:error:uppercase')
        expect(result).toContain('password:error:number')
        expect(result).toContain('password:error:special')
    })

    it('should only return error for the conditions not met', () => {
        let result = passwordComplexityCheck('1')
        expect(result.length).toBe(4)
        expect(result).toContain('password:error:length')
        expect(result).toContain('password:error:lowercase')
        expect(result).toContain('password:error:uppercase')
        expect(result).toContain('password:error:special')

        result = passwordComplexityCheck('a')
        expect(result.length).toBe(4)
        expect(result).toContain('password:error:length')
        expect(result).toContain('password:error:uppercase')
        expect(result).toContain('password:error:number')
        expect(result).toContain('password:error:special')

        result = passwordComplexityCheck('A')
        expect(result.length).toBe(4)
        expect(result).toContain('password:error:length')
        expect(result).toContain('password:error:lowercase')
        expect(result).toContain('password:error:number')
        expect(result).toContain('password:error:special')

        result = passwordComplexityCheck('!')
        expect(result.length).toBe(4)
        expect(result).toContain('password:error:length')
        expect(result).toContain('password:error:lowercase')
        expect(result).toContain('password:error:uppercase')
        expect(result).toContain('password:error:number')

        result = passwordComplexityCheck('1111111')
        expect(result.length).toBe(3)
        expect(result).toContain('password:error:lowercase')
        expect(result).toContain('password:error:uppercase')
        expect(result).toContain('password:error:special')
    })

    it('should return empty array if all conditions are met', () => {
        const result = passwordComplexityCheck('1aA!a2')
        expect(result.length).toBe(0)
    })
})