import { File } from '../entities/File'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'

@Resolver()
export class FileResolver {
    @Query(() => [File])
    files(): Promise<File[]> {
        return File.find()
    }

    @Query(() => File, { nullable: true })
    file(
        @Arg('id') id: number
    ): Promise<File | undefined> {
        return File.findOne(id)
    }

    @Mutation(() => File)
    async createFile(
        @Arg('title') title: string
    ): Promise<File> {
        return File.create({
            title,
            text: 'Write something amazing...'
        }).save()
    }

    @Mutation(() => File, { nullable: true })
    async updateFile(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string | undefined,
        @Arg('text', () => String, { nullable: true }) text: string | undefined
    ): Promise<File | null> {
        const file = await File.findOne(id)

        if (!file) return null

        if (typeof title !== 'undefined') {
            await File.update({id}, {title})
        }

        if (typeof text !== 'undefined') {
            await File.update({id}, {text})
        }

        return file
    }

    @Mutation(() => Boolean)
    async deleteFile(
        @Arg('id') id: number
    ): Promise<Boolean> {
        await File.delete(id)

        return true
    }
}
