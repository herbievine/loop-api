import 'dotenv-safe/config'
import { initCors, initDatabase, initSession } from './utils/config'
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
import { FolderResolver } from './resolvers/folder'

const main = async () => {
    const connection = await initDatabase()

    // if (process.env.NODE_ENV === 'production') {
    await connection.runMigrations()
    // }

    const app = express()

    app.set('trust proxy', 1)

    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)

    app.use(cors(initCors()))
    app.use(initSession(redis, RedisStore))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, FolderResolver, FileResolver],
            validate: false
        }),
        context: ({ req, res }): ApolloContext =>
            <ApolloContext>{ req, res, redis }
    })

    apolloServer.applyMiddleware({ app, cors: false })

    const port = process.env.PORT
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
