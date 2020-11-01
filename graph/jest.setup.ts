import { config } from 'dotenv'

export default async () => {
    config()
    console.log('setup')
}
