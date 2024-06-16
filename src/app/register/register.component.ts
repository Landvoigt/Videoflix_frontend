import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { RestService } from '../services/rest.service';
import { CommonModule } from '@angular/common';
import { EmailRegex, PasswordRegex } from '../utils/regex';
import { RegisterFormModel } from '../../models/auth.model';
import { ErrorService } from '../services/error.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  public registerForm: FormGroup<RegisterFormModel> = new FormGroup<RegisterFormModel>(
    {
      email:            new FormControl(null, [Validators.required, Validators.pattern(EmailRegex)]),
      password:         new FormControl(null, [Validators.required, Validators.pattern(PasswordRegex)]),
      confirmPassword:  new FormControl(null, [Validators.required]),
    },
    {
      validators: this.passwordMatchValidator('password', 'confirmPassword')
    }
  );

  constructor(
    private router: Router,
    private restService: RestService, 
    private errorService: ErrorService, 
    private alertService: AlertService) { }

  get emailFormField() {
    return this.registerForm.get('email');
  }

  get passwordFormField() {
    return this.registerForm.get('password');
  }

  get confirmPasswordFormField() {
    return this.registerForm.get('confirmPassword');
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

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.restService.register(email!, password!).subscribe({
        next: (response) => {
          this.alertService.showAlert('User created successfully!', 'success');
          this.router.navigate(['/login']);

          /////
          console.log(response);
        },
        error: (err) => {
          this.errorService.handleRegisterError(err);

          /////
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