import { Folder } from '../entities/Folder'
import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { ApolloContext } from '../types'
import { COOKIE_NAME } from '../constants'
import { isAuthenticated } from '../middleware/isAuthenticated'
import { validateId } from '../utils/validators'

@ObjectType()
class FolderFieldError {
    @Field()
    field: 'uuid' | 'not found'

    @Field()
    message: string
}

@ObjectType()
class FolderResponse {
    @Field(() => [FolderFieldError], { nullable: true })
    errors?: FolderFieldError[]

    @Field(() => Folder, { nullable: true })
    data?: Folder
}

@ObjectType()
class FoldersResponse {
    @Field(() => [FolderFieldError], { nullable: true })
    errors?: FolderFieldError[]

    @Field(() => [Folder], { nullable: true })
    data?: Folder[]
}

@Resolver()
export class FolderResolver {
    @Query(() => FoldersResponse)
    async folders(@Ctx() { req }: ApolloContext): Promise<FoldersResponse> {
        const folders = await Folder.find({
            creatorId: req.session[COOKIE_NAME]
        })

        if (!folders || folders.length === 0) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No folders are linked to this user'
                    }
                ]
            }
        }

        return { data: folders }
    }

    @Query(() => FolderResponse, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async folder(@Arg('id') id: string): Promise<FolderResponse> {
        const isIdValid: FolderFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const folder = await Folder.findOne(id)

        if (!folder) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No folder was found'
                    }
                ]
            }
        }

        return { data: folder }
    }

    @Mutation(() => FolderResponse)
    @UseMiddleware(isAuthenticated)
    async createFolder(
        @Arg('title') title: string,
        @Ctx() { req }: ApolloContext
    ): Promise<FolderResponse> {
        const folder = await Folder.create({
            title,
            creatorId: req.session[COOKIE_NAME]
        }).save()

        if (!folder) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No folder was found'
                    }
                ]
            }
        }

        return { data: folder }
    }

    @Mutation(() => FolderResponse, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async updateFolder(
        @Arg('id') id: string,
        @Arg('title', () => String, { nullable: true })
        title: string | undefined
    ): Promise<FolderResponse> {
        const isIdValid: FolderFieldError | null = validateId(id)

        if (isIdValid) {
            return {
                errors: [isIdValid]
            }
        }

        const folder = await Folder.findOne(id)

        if (!folder) {
            return {
                errors: [
                    {
                        field: 'not found',
                        message: 'No folder was found'
                    }
                ]
            }
        }

        if (typeof title !== 'undefined') {
            await Folder.update(id, { title })
        }

        return { data: await Folder.findOne(id) }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async deleteFolder(@Arg('id') id: string): Promise<Boolean> {
        try {
            await Folder.delete(id)
            return true
        } catch {
            return false
        }
    }
}
