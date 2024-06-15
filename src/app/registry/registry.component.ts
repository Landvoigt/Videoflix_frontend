import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { EmailRegex, PasswordRegex } from '../utils/regex';
import { RegistryFormModel } from '../../models/auth.model';

@Component({
  selector: 'app-registry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registry.component.html',
  styleUrl: './registry.component.scss'
})
export class RegistryComponent {
  public registerForm: FormGroup<RegistryFormModel> = new FormGroup<RegistryFormModel>({
    email: new FormControl(null, [Validators.required, Validators.pattern(EmailRegex)]),
    password: new FormControl(null, [Validators.required, Validators.pattern(PasswordRegex)]),
    confirmPassword: new FormControl(null, [Validators.required]),
  }, { validators: this.passwordMatchValidator('password', 'confirmPassword') });

  constructor(private authService: AuthService, private router: Router) { }

  passwordFieldHasError() {
    return (this.passwordFormField?.dirty || this.passwordFormField?.touched) && this.passwordFormField?.errors;
  }

  passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (control && matchingControl && control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordsDoNotMatch: true });
        return { passwordsDoNotMatch: true };
      } else {
        matchingControl?.setErrors(null);
        return null;
      }
    }
  }

  get emailFormField() {
    return this.registerForm.get('email');
  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  get confirmPasswordFormField() {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService.register(email!, password!).subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration error', err);
        },
        complete: () => {
        }
      });
    }
  }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}