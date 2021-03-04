import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import mikroConfig from './mikro-orm.config'

const initMikroOrm = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    return orm
}

export { initMikroOrm }
