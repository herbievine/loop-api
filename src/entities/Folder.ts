import { Field, ObjectType } from 'type-graphql'
import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    ManyToOne,
    OneToMany
} from 'typeorm'
import { User } from './User'
import { File } from './File'

@ObjectType()
@Entity()
export class Folder extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Field(() => String)
    @CreateDateColumn({ type: 'date' })
    createdAt: Date

    @Field(() => String)
    @UpdateDateColumn({ type: 'date' })
    updatedAt: Date

    @Field()
    @Column()
    title!: string

    @Field()
    @Column()
    creatorId: string

    @ManyToOne(() => User, (user) => user.folders, { onDelete: 'CASCADE' })
    creator: User

    @OneToMany(() => File, (file) => file.folder)
    files: File[]
}
