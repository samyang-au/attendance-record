import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import * as path from 'path'

const typesArray = loadFilesSync(path.join(__dirname), { extensions: ['graphql'] })

export const typeDefs = mergeTypeDefs(typesArray)
