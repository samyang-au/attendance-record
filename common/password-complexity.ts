/**
 * Convert array of strings into tuple type
 */
function tuple<T extends string[]>(...data: T) {
    return data
}

export const passwordValidationErrorList = tuple(
    "password:error:length",
    "password:error:lowercase",
    "password:error:uppercase",
    "password:error:number",
    "password:error:special"
)

type errorArray = typeof passwordValidationErrorList[number]

// IMPORTANT: when adding a new error key remember to add it to passwordValidationErrorList first
export const passwordComplexityCheck = (password: string): errorArray[] => {
    const result: errorArray[] = []
    if (password == null || password.length < 6) {
        result.push("password:error:length")
    }
    if (password == null || password.search(/[a-z]/) < 0) {
        result.push("password:error:lowercase")
    }
    if (password == null || password.search(/[A-Z]/) < 0) {
        result.push("password:error:uppercase")
    }
    if (password == null || password.search(/[0-9]/) < 0) {
        result.push("password:error:number")
    }
    if (password == null || password.search(/[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,.\/ ?]/) < 0) {
        result.push("password:error:special")
    }
    return result
}