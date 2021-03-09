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
import {
    validateEmail,
    validatePassword,
    validateUsername,
    Error
} from '../utils/validators'
import { COOKIE_NAME, REDIS_PREFIX } from '../constants'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'

@ObjectType()
class UserFieldError {
    @Field()
    field: 'username' | 'email' | 'password' | 'token'

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [UserFieldError], { nullable: true })
    errors?: UserFieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: ApolloContext): Promise<User | undefined> {
        if (!req.session[COOKIE_NAME]) return undefined
        else return await User.findOne(req.session[COOKIE_NAME])
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('email') email: string,
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() { req }: ApolloContext
    ): Promise<UserResponse | undefined> {
        const isEmailValid: Error | null = validateEmail(email)
        const isUsernameValid: Error | null = validateUsername(username)
        const isPasswordValid: Error | null = validatePassword(password)

        console.log('email:', isEmailValid)

        if (isEmailValid) {
            return {
                errors: [isEmailValid]
            }
        }

        if (isUsernameValid) {
            return {
                errors: [isUsernameValid]
            }
        }

        if (isPasswordValid) {
            return {
                errors: [isPasswordValid]
            }
        }

        const hashedPassword = await hash(password)

        try {
            const user: User = await User.create({
                email,
                username: username.toLowerCase(),
                password: hashedPassword
            }).save()

            req.session[COOKIE_NAME] = user.id

            return { user }
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
            } else {
                return undefined
            }
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { req }: ApolloContext
    ): Promise<UserResponse> {
        const isEmailValid: Error | null = validateEmail(email)
        const isPasswordValid: Error | null = validatePassword(password)

        if (isEmailValid) {
            return {
                errors: [isEmailValid]
            }
        }

        if (isPasswordValid) {
            return {
                errors: [isPasswordValid]
            }
        }

        const user = await User.findOne({ email })

        if (!user) {
            return {
                errors: [{
                    field: 'email',
                    message: "That user doesn't exist"
                }]
            }
        }

        const isValid = await verify(user.password, password)

        if (!isValid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Password is incorrect'
                }]
            }
        }

        req.session[COOKIE_NAME] = user.id

        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: ApolloContext
    ): Promise<boolean> {
        const user = await User.findOne({ email })

        if (user) {
            const token = v4()

            await redis.set(
                REDIS_PREFIX + token,
                user.id,
                'ex',
                1000 * 60 * 60 * 24
            )

            await sendEmail(user.email, token)
        }

        return true
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('password') password: string,
        @Ctx() { redis }: ApolloContext
    ): Promise<UserResponse> {
        const isPasswordValid: Error | null = validatePassword(password)

        if (isPasswordValid) {
            return {
                errors: [isPasswordValid]
            }
        }
            
        const userId = await redis.get(REDIS_PREFIX + token)

        if (!userId) {
            return {
                errors: [{
                    field: 'token',
                    message: 'That token has expired'
                }]
            }
        }

        const id = parseInt(userId)

        const user = await User.findOne(id)

        if (!user) {
            return {
                errors: [{
                    field: 'email',
                    message: 'That user no longer exists'
                }]
            }
        }

        User.update({id}, {
            password: await hash(password)
        })

        await redis.del(REDIS_PREFIX + token)

        return { user }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: ApolloContext): Promise<boolean> {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
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
        @Arg('email') email: string
    ): Promise<boolean> {
        await User.delete({email})

        return true
    }
}
