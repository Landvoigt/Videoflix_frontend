import { FormControl } from "@angular/forms";

export interface RegistryFormModel {
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
}