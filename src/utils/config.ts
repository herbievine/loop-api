import 'reflect-metadata'
import 'dotenv-safe/config'
import { User } from '../entities/User'
import { File } from '../entities/File'
import { createConnection } from 'typeorm'
import session from 'express-session'
import { COOKIE_NAME } from '../constants'
import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'
import cors from 'cors'
import { Folder } from '../entities/Folder'

const initDatabase = async () =>
    await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: process.env.NODE_ENV !== 'production',
        synchronize: process.env.NODE_ENV !== 'production',
        entities: [User, Folder, File]
    })

const initSession = (redis: Redis, Store: RedisStore) =>
    session({
        name: COOKIE_NAME,
        store: new Store({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            domain:
                process.env.NODE_ENV === 'production'
                    ? 'loop.herbievine.com'
                    : undefined
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false
    })

const initCors = (): Parameters<typeof cors>[0] => ({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})

export { initDatabase, initSession, initCors }
