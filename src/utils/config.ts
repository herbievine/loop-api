import 'reflect-metadata'
import { User } from '../entities/User'
import { File } from '../entities/File'
import { createConnection } from 'typeorm'
import session from 'express-session'
import { COOKIE_NAME } from '../constants'
import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'

const initDatabase = async () => await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME ?? 'alpine',
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    logging: process.env.NODE_ENV !== 'production',
    synchronize: true,
    entities: [User, File]
})

const initSession = (redis: Redis, Store: RedisStore) => session({
    name: COOKIE_NAME,
    store: new Store({
        host: 'localhost',
        port: 6379,
        client: redis,
        disableTouch: true
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET ?? 'dev',
    resave: false
})

export { initDatabase, initSession }
