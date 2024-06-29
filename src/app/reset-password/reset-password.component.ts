import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResetPasswordFormModel } from '../interfaces/auth.interface';
import { PasswordRegex } from '../utils/regex';
import { AlertService } from '../services/alert.service';
import { ErrorService } from '../services/error.service';
import { RestService } from '../services/rest.service';
import { fadeInPage } from '../utils/animations';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  animations: [fadeInPage]
})
export class ResetPasswordComponent implements OnInit {

  public resetPasswordForm: FormGroup<ResetPasswordFormModel> = new FormGroup<ResetPasswordFormModel>(
    {
      password: new FormControl(null, [Validators.required, Validators.pattern(PasswordRegex)]),
      confirmPassword: new FormControl(null, [Validators.required]),
    },
    {
      validators: this.passwordMatchValidator('password', 'confirmPassword')
    }
  );

  token: string | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public navService: NavigationService,
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get passwordFormField() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPasswordFormField() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.restService.validateResetToken(this.token).subscribe({
        next: (response) => {
          if (!response.valid) {
            this.navService.error({ queryParams: { message: 'Invalid or expired token' } });
          }
        },
        error: (err) => {
          this.navService.error({ queryParams: { message: 'Error validating token' } });
        }
      });
    } else {
      this.navService.error({ queryParams: { message: 'Token not provided' } });
    }
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

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { password } = this.resetPasswordForm.value;
      this.loading = true;
      this.restService.resetPassword(this.token!, password!).subscribe({
        next: (response) => {
          this.alertService.showAlert('Password reset successfully!', 'success');
          this.navService.login();
        },
        error: (err) => {
          this.errorService.handleResetPasswordError(err);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }
}