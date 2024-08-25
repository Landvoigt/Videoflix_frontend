import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { RestService } from '@services/rest.service';
import { ErrorService } from '@services/error.service';
import { LoginFormModel } from '../interfaces/auth.interface';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { fadeInPage } from '@utils/animations';
import { AlertService } from '@services/alert.service';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [fadeInPage]
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup<LoginFormModel> = new FormGroup<LoginFormModel>(
    {
      identifier: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    }
  );

  verified: boolean = false;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public navService: NavigationService,
    private restService: RestService,
    private errorService: ErrorService,
    private authService: AuthService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.alertService.showAlert('User verified successfully! You can now login', 'success');
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { identifier, password } = this.loginForm.value;
      this.loading = true;
      this.restService.login(identifier!, password!).subscribe({
        next: (response) => {
          const token = response.token;
          this.authService.login(token);

          /////
          console.log(response);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.errorService.handleLoginError(err);
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
}