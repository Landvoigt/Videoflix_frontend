import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RestService } from '../services/rest.service';
import { ErrorService } from '../services/error.service';
import { LoginFormModel } from '../../models/auth.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [fadeInPage]
})
export class LoginComponent {

  public loginForm: FormGroup<LoginFormModel> = new FormGroup<LoginFormModel>(
    {
      identifier: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    }
  );

  constructor(
    private router: Router,
    private restService: RestService,
    private errorService: ErrorService,
    private authService: AuthService) { }

  onSubmit() {
    if (this.loginForm.valid) {
      const { identifier, password } = this.loginForm.value;
      this.restService.login(identifier!, password!).subscribe({
        next: (response) => {
          const token = response.token;
          this.authService.login(token);

          /////
          console.log(response);
        },
        error: (err) => {
          this.errorService.handleLoginError(err);

          /////
          // console.error('Login error:', err);
        },
        complete: () => {
        }
      });
    }
  }

  get identifierFormField() {
    return this.loginForm.get('identifier');
  }

  get passwordFormField() {
    return this.loginForm.get('password');
  }

  navigateToSendMail() {
    this.router.navigate(['/send_mail']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}