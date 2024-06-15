import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private authService: AuthService,
    private errorService: ErrorService) {

    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { identifier, password } = this.loginForm.value;
      this.authService.login(identifier, password).subscribe({
        next: (response) => {
          this.router.navigate(['/']);

          /////
          console.log(response);
        },
        error: (err) => {
          this.errorService.handleLoginError(err);

          /////
          console.error('Login error:', err);
        },
        complete: () => {
        }
      });
    }
  }

  navigateToSendMail() {
    this.router.navigate(['/send_mail']);
  }

  navigateToRegistry() {
    this.router.navigate(['/registry']);
  }
}