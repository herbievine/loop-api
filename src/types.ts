import { Request, Response } from 'express'
import { Redis } from 'ioredis'

export type ApolloContext = {
    req: Request & { session: Express.Session }
    res: Response
    redis: Redis
}
