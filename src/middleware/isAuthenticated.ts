import { ApolloContext } from '../types'
import { MiddlewareFn } from 'type-graphql'
import { COOKIE_NAME } from '../constants'

const isAuthenticated: MiddlewareFn<ApolloContext> = ({ context }, next) => {
    const cookie = context.req.session[COOKIE_NAME]

    if (!cookie) {
        throw new Error('User not authenticated')
    }

    return next()
}

export { isAuthenticated }
