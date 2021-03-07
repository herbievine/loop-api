import { initDatabase, initSession } from './utils/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'
import { FileResolver } from './resolvers/file'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { ApolloContext } from './types'
import cors from 'cors'
// import { User } from './entities/User'
// import { File } from './entities/File'

const whitelist = [
    'http://localhost:8080',
    'http://localhost:4000',
    'https://alpine-webapp.netlify.app'
]

const corsOptions: Parameters<typeof cors>[0] = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)

        if (whitelist.indexOf(origin) === -1) {
            const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
            return callback(new Error(msg), false)
        }

        return callback(null, true)
    },
    credentials: true
}

const main = async () => {
    await initDatabase()

    // User.clear()
    // File.clear()

    const app = express()

    app.set('trust proxy', 1)

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(cors(corsOptions))
    app.use(initSession(redis, RedisStore))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, FileResolver],
            validate: false
        }),
        context: ({ req, res }): ApolloContext =>
            <ApolloContext>{ req, res, redis }
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

