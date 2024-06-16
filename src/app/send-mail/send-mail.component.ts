import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SendMailFormModel } from '../../models/auth.model';
import { EmailRegex } from '../utils/regex';
import { RestService } from '../services/rest.service';
import { AlertService } from '../services/alert.service';
import { ErrorService } from '../services/error.service';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss',
  animations: [fadeInPage]
})
export class SendMailComponent {

  public sendMailForm: FormGroup<SendMailFormModel> = new FormGroup<SendMailFormModel>(
    {
      email: new FormControl(null, [Validators.required, Validators.pattern(EmailRegex)]),
    }
  );

  constructor(
    private router: Router,
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get emailFormField() {
    return this.sendMailForm.get('email');
  }

  onSubmit() {
    if (this.sendMailForm.valid) {
      const { email } = this.sendMailForm.value;
      this.restService.sendMail(email!).subscribe({
        next: (response) => {
          this.alertService.showAlert('Email sent successfully!', 'success');
          this.router.navigate(['/login']);

          /////
          console.log(response);
        },
        error: (err) => {
          this.errorService.handleSendMailError(err);

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