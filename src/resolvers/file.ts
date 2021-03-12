import { File } from '../entities/File'
import {
    Arg,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { isAuthenticated } from '../middleware/isAuthenticated'
import { validateId } from '../utils/validators'

@ObjectType()
class FileFieldError {
    @Field()
    field: 'uuid' | 'not found'

    @Field()
    message: string
}

@ObjectType()
class FileResponse {
    @Field(() => [FileFieldError], { nullable: true })
    errors?: FileFieldError[]

    @Field(() => File, { nullable: true })
    data?: File
}

@ObjectType()
class FilesResponse {
    @Field(() => [FileFieldError], { nullable: true })
    errors?: FileFieldError[]

    @Field(() => [File], { nullable: true })
    data?: File[]
}

@Resolver()
export class FileResolver {
    @Query(() => FilesResponse, { nullable: true })
    async files(@Arg('id') id: string): Promise<FilesResponse> {
        const isIdValid: FileFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const files = await File.find({
            folderId: id
        })

        if (!files || files.length === 0) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No files are linked to this folder'
                    }
                ]
            }
        }

        return { data: files }
    }

    @Query(() => FileResponse, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async file(@Arg('id') id: string): Promise<FileResponse> {
        const isIdValid: FileFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const file = await File.findOne(id)

        if (!file) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No file was found'
                    }
                ]
            }
        }

        return { data: file }
    }

    @Mutation(() => FileResponse, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async createFile(
        @Arg('id') id: string,
        @Arg('title') title: string
    ): Promise<FileResponse> {
        const isIdValid: FileFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const file = await File.create({
            title,
            text: 'Write something amazing...',
            folderId: id
        }).save()

        if (!file) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No file was found'
                    }
                ]
            }
        }

        return { data: file }
    }

    @Mutation(() => FileResponse, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async updateFile(
        @Arg('id') id: string,
        @Arg('title', () => String, { nullable: true })
        title: string | undefined,
        @Arg('text', () => String, { nullable: true }) text: string | undefined
    ): Promise<FileResponse> {
        const isIdValid: FileFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const file = await File.findOne(id)

        if (!file) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No file was found'
                    }
                ]
            }
        }

        if (typeof title !== 'undefined') {
            await File.update(id, { title })
        }

        if (typeof text !== 'undefined') {
            await File.update(id, { text })
        }

        return { data: await File.findOne(id) }
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
