export const DB_NAME = 'attendance-record'
export const SCHEMA = 'attendance-record'

const createStoredProcString = <T extends string>(names: T[]): Record<T, string> =>
    names.reduce((obj, name) => {
        obj[name] = `"${SCHEMA}"."${name}"`
        return obj
    }, {} as Record<T, string>)

export const STORED_PROC = createStoredProcString([
    'deleteMemberGroup',
    'getAttendanceGroup',
    'getFamily',
    'getGroup',
    'getGroupMembers',
    'getMember',
    'getMembers',
    'getMemberType',
    'getMemberTypes',
    'getSecurityGroup',
    'getServiceRecord',
    'getUserLogin',
    'insertMemberGroup',
    'resetPassword',
    'updateMember',
    'updatePassword',
])
