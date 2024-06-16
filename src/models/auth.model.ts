import { FormControl } from "@angular/forms";

export interface RegisterFormModel {
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
}

export interface LoginFormModel {
    identifier: FormControl<string | null>;
    password: FormControl<string | null>;
}

export interface SendMailFormModel {
    email: FormControl<string | null>;
}

export interface ResetPasswordFormModel {
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
}