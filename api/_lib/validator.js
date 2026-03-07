export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    // Mínimo 10 caracteres, una mayúscula, un número y un símbolo
    const hasMinLength = password.length >= 10;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasMinLength && hasUpper && hasNumber && hasSymbol;
}

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim();
}
