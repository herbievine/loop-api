import { Request, Response } from 'express'
import { Session } from 'express-session'
import { Redis } from 'ioredis'

export type ApolloContext = {
    req: Request & { session: Session & { [key: string]: string } }
    res: Response
    redis: Redis
}
