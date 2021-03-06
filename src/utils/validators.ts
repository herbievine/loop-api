const emailRegex: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const usernameRegex: RegExp = /^[a-zA-Z]+$/

export interface Error {
    field: 'username' | 'email' | 'password'
    message: string
}

export const validateEmail = (email?: string): Error | null => {
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
): Error | null => {
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
): Error | null => {
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
