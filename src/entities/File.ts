import { Field, ObjectType } from 'type-graphql'
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class File extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date

    @Field()
    @Column()
    title!: string

    @Field()
    @Column()
    text: string

    @Field()
    @Column()
    creatorId: number

    @ManyToOne(() => User, user => user.files)
    creator: User
}
