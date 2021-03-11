import { Field, ObjectType } from 'type-graphql'
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'
import { Folder } from './Folder'

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
    @Column({ unique: true })
    username!: string

    @Field()
    @Column({ unique: true })
    email!: string

    @Column()
    password!: string

    @OneToMany(() => Folder, (folder) => folder.creator)
    folders: Folder[]
}
