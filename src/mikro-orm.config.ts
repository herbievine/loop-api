import { User } from './entities/User'
import { File } from './entities/File'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'

const mikroConfig: Parameters<typeof MikroORM.init>[0] = {
    dbName: 'alpine',
    type: 'postgresql',
    user: 'postgres',
    password: 'postgres',
    entities: [User, File],
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
}

export default mikroConfig
