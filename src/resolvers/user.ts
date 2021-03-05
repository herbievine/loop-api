import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver
} from 'type-graphql'
import { ApolloContext } from '../types'
import { User } from '../entities/User'
import { hash, verify } from 'argon2'
import { validateEmail, validatePassword, validateUsername, Error } from '../utils/validators'
import { COOKIE_NAME } from '../constants'

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: ApolloContext): Promise<User | null> {
        if (!req.session[COOKIE_NAME]) return null
        else return await em.findOne(User, { id: req.session[COOKIE_NAME] })
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('email') email: string,
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: ApolloContext
    ): Promise<UserResponse> {
        const isEmailValid: Error | null = validateEmail(email)
        const isUsernameValid: Error | null = validateUsername(username)
        const isPasswordValid: Error | null = validatePassword(password)

        console.log('email:', isEmailValid)

        if (isEmailValid) return {
            errors: [isEmailValid]
        }

        if (isUsernameValid) return {
            errors: [isUsernameValid]
        }

        if (isPasswordValid) return {
            errors: [isPasswordValid]
        }

        const hashedPassword = await hash(password)

        const user = em.create(User, {
            email,
            username: username.toLowerCase(),
            password: hashedPassword
        })

        try {
            await em.persistAndFlush(user)
        } catch (err) {
            if (err.code === '23505' && err.detail.includes('username')) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'That username has already been taken'
                        }
                    ]
                }
            } else if (err.code === '23505' && err.detail.includes('email')) {
                return {
                    errors: [
                        {
                            field: 'email',
                            message: 'That email has already been taken'
                        }
                    ]
                }
            }
        }

        req.session[COOKIE_NAME] = user.id

        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: ApolloContext
    ): Promise<UserResponse> {
        const isEmailValid: Error | null = validateEmail(email)
        const isPasswordValid: Error | null = validatePassword(password)

        if (isEmailValid) return {
            errors: [isEmailValid]
        }

        if (isPasswordValid) return {
            errors: [isPasswordValid]
        }

        const user = await em.findOne(User, { email })

        if (!user) {
            return {
                errors: [
                    {
                        field: 'email',
                        message: "That user doesn't exist"
                    }
                ]
            }
        }

        const isValid = await verify(user.password, password)

        if (!isValid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password is incorrect'
                    }
                ]
            }
        }

        req.session[COOKIE_NAME] = user.id

        return { user }
    }

    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: ApolloContext
    ): Promise<boolean> {
        return new Promise(resolve => {
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME)

                if (err) {
                    console.log(err)
                    return resolve(false)
                }

                return resolve(true)
            })
        })
    }

    @Mutation(() => Boolean)
    async deleteUser(
        @Arg('email') email: string,
        @Ctx() { em }: ApolloContext
    ): Promise<boolean> {
        await em.nativeDelete(User, { email })

        return true
    }
}
