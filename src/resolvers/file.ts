import { File } from '../entities/File'
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { ApolloContext } from '../types'
import { COOKIE_NAME } from '../constants'
import { isAuthenticated } from '../middleware/isAuthenticated'

@Resolver()
export class FileResolver {
    @Query(() => [File], { nullable: true })
    async files(@Ctx() { req }: ApolloContext): Promise<File[] | null> {
        const files = await File.find({ creatorId: req.session[COOKIE_NAME] })

        if (files.length === 0) return null

        return files
    }

    @Query(() => File, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async file(@Arg('id') id: string): Promise<File | null> {
        const file = await File.findOne(id)

        if (!file) return null

        return file
    }

    @Mutation(() => File)
    @UseMiddleware(isAuthenticated)
    async createFile(
        @Arg('title') title: string,
        @Ctx() { req }: ApolloContext
    ): Promise<File> {
        const file = await File.create({
            title,
            text: 'Write something amazing...',
            creatorId: req.session[COOKIE_NAME]
        }).save()

        return file
    }

    @Mutation(() => File, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async updateFile(
        @Arg('id') id: string,
        @Arg('title', () => String, { nullable: true })
        title: string | undefined,
        @Arg('text', () => String, { nullable: true }) text: string | undefined
    ): Promise<File | null> {
        const file = await File.findOne(id)

        if (!file) return null

        if (typeof title !== 'undefined') {
            await File.update({ id }, { title })
        }

        if (typeof text !== 'undefined') {
            await File.update({ id }, { text })
        }

        return (await File.findOne(id))!
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async deleteFile(@Arg('id') id: string): Promise<Boolean> {
        try {
            await File.delete(id)
            return true
        } catch {
            return false
        }
    }
}
