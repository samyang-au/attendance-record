const createGroup = <T extends string[]>(...data: T): { [K in T[number]]: K } =>
    data.reduce((result, current) => {
        result[current] = current
        return result
    }, {}) as { [K in T[number]]: K }

export const CORE_GROUP = createGroup(
    'Admin',
    'AttendanceFiltering',
    'AttendanceGrouping',
    'Committee',
    'CookingGroup',
    'Family',
    'RE',
    'Usher',
)