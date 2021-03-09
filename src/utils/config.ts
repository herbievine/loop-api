import 'reflect-metadata'
import { User } from '../entities/User'
import { File } from '../entities/File'
import { createConnection } from 'typeorm'
import session from 'express-session'
import { COOKIE_NAME } from '../constants'
import { Redis } from 'ioredis'
import { RedisStore } from 'connect-redis'
import cors from 'cors'

const whitelist = [
    'http://localhost:8080',
    'http://localhost:4000',
    'https://loop-sigma.vercel.app/'
]

const initDatabase = async () => await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME ?? 'loop',
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

const initCors = (): Parameters<typeof cors>[0] => ({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)

        if (whitelist.indexOf(origin) === -1) {
            const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
            return callback(new Error(msg), false)
        }

        return callback(null, true)
    },
    credentials: true
})

export { initDatabase, initSession, initCors }
