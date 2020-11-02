export const passwordComplexityCheck = (password: string): string[] => {
    const result = []
    if (password == null || password.length < 6) {
        result.push('password length should be >= 6')
    }
    if (password == null || password.search(/[a-z]/) < 0) {
        result.push('password should contains at least 1 lower case letter')
    }
    if (password == null || password.search(/[A-Z]/) < 0) {
        result.push('password should contains at least 1 upper case letter')
    }
    if (password == null || password.search(/[0-9]/) < 0) {
        result.push('password should contains at least 1 number')
    }
    if (password == null || password.search(/[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,.\/ ?]/) < 0) {
        result.push('password should contains at least 1 special characters')
    }
    return result
}