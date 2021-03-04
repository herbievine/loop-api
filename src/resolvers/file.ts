import { File } from '../entities/File'
import { ApolloContext } from 'src/types'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

@Resolver()
export class FileResolver {
    @Query(() => [File])
    files(@Ctx() { em }: ApolloContext): Promise<File[]> {
        return em.find(File, {})
    }

    @Query(() => File, { nullable: true })
    file(
        @Arg('id') id: number,
        @Ctx() { em }: ApolloContext
    ): Promise<File | null> {
        return em.findOne(File, { id })
    }

    @Mutation(() => File)
    async createFile(
        @Arg('title') title: string,
        @Ctx() { em }: ApolloContext
    ): Promise<File> {
        const file = em.create(File, {
            title,
            text: 'Write something amazing...'
        })
        await em.persistAndFlush(file)

        return file
    }

    @Mutation(() => File, { nullable: true })
    async updateFile(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true })
        title: string | undefined,
        @Arg('text', () => String, { nullable: true }) text: string | undefined,
        @Ctx() { em }: ApolloContext
    ): Promise<File | null> {
        const file = await em.findOne(File, { id })

        if (!file) return null

        if (typeof title !== 'undefined') file.title = title
        if (typeof text !== 'undefined') file.text = text

        await em.persistAndFlush(file)

        return file
    }

    @Mutation(() => Boolean)
    async deleteFile(
        @Arg('id') id: number,
        @Ctx() { em }: ApolloContext
    ): Promise<Boolean> {
        await em.nativeDelete(File, { id })

        return true
    }
}
