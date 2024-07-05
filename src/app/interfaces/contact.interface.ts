import { FormControl } from "@angular/forms";

export interface ContactFormModel {
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    company: FormControl<string | null>;
    email: FormControl<string | null>;
    message: FormControl<string | null>;
}