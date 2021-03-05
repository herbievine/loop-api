import { initMikroOrm } from './connect'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'
import { FileResolver } from './resolvers/file'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { ApolloContext } from './types'
import cors from 'cors'
import { COOKIE_NAME } from './constants'

const whitelist = ['http://localhost:8080', 'http://localhost:4000', 'https://alpine-webapp.netlify.app']

const corsOptions: Parameters<typeof cors>[0] = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (whitelist.indexOf(origin) === -1) {
            const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
            return callback(new Error(msg), false);
        }

        return callback(null, true);
    },
    credentials: true
}

const main = async () => {
    const orm = await initMikroOrm()

    const app = express()

    app.set('trust proxy', 1)

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(cors(corsOptions))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                host: 'localhost',
                port: 6379,
                client: redisClient,
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
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, FileResolver],
            validate: false
        }),
        context: ({ req, res }): ApolloContext =>
            <ApolloContext>{ em: orm.em, req, res }
    })

    apolloServer.applyMiddleware({ app, cors: false })

    const port = process.env.PORT ?? 8080
    app.listen(port, () => console.log(`Server running at localhost:${port}`))
}

main()
    .then(() => console.log('App initialized 🚀'))
    .catch((err) =>
        console.error(
            '=============== MAIN ===============\n' +
                `${err}\n` +
                '===================================='
        )
    )
