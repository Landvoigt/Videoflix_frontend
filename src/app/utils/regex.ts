export const NameRegex: RegExp = /^[a-zA-Z\s]+$/;
export const EmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PasswordRegex: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;
export const CompanyNameRegex: RegExp = /^[a-zA-Z0-9\s\.\'\-]+$/;