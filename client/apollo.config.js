module.exports = {
    client: {
        service: {
            name: 'attendance-record',
            localSchemaFile: './graphql-schema.json',
        },
        includes: ['./src/**/*.@(ts|tsx)']
    }
}