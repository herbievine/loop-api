const emailRegex: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const usernameRegex: RegExp = /^[a-zA-Z]+$/
const uuidV4Regex: RegExp = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/

export interface UserError {
    field: 'username' | 'email' | 'password'
    message: string
}

export interface FolderOrFileError {
    field: 'uuid'
    message: string
}

export const validateEmail = (email?: string): UserError | null => {
    if (!email) {
        return {
            field: 'email',
            message: 'Email is a required field'
        }
    } else if (!emailRegex.test(email)) {
        return {
            field: 'email',
            message: 'Email not correctly formatted'
        }
    }

    return null
}

export const validateUsername = (
    username?: string,
    minLength?: number
): UserError | null => {
    if (!username) {
        return {
            field: 'username',
            message: 'Username is a required field'
        }
    } else if (minLength && username.length < minLength) {
        return {
            field: 'username',
            message: `Username is too small. ${minLength} minimum`
        }
    } else if (!usernameRegex.test(username)) {
        return {
            field: 'username',
            message: 'Username can only contain letters'
        }
    }

    return null
}

export const validatePassword = (
    password?: string,
    minLength?: number
): UserError | null => {
    if (!password) {
        return {
            field: 'password',
            message: 'Password is a required field'
        }
    } else if (minLength && password.length < minLength) {
        return {
            field: 'password',
            message: `Password is too small. ${minLength} minimum`
        }
    }

    return null
}

export const validateId = (uuid: string): FolderOrFileError | null => {
    if (!uuid) {
        return {
            field: 'uuid',
            message: 'ID is a required field'
        }
    } else if (!uuidV4Regex.test(uuid)) {
        return {
            field: 'uuid',
            message: 'Invalid ID'
        }
    }

    return null
}
