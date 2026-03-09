/**
 * Shared password validation — single source of truth for all endpoints.
 */
export function validatePassword(password: unknown): { valid: boolean; message: string } {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true, message: '' };
}
