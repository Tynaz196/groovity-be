//PASSWORD REGEX
// At least 8 characters long.
// At least one uppercase letter (A-Z).
// At least one lowercase letter (a-z).
// At least one digit (0-9).
// At least one special character (from: @$!%*?&).
export const usernameRegex = /^[a-zA-Z0-9-]{3,16}$/;
export const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const phoneRegex = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/;
