import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SendMailFormModel } from '../interfaces/auth.interface';
import { EmailRegex } from '../utils/regex';
import { RestService } from '../services/rest.service';
import { AlertService } from '../services/alert.service';
import { ErrorService } from '../services/error.service';
import { fadeInPage } from '../utils/animations';
import { NavigationService } from '../services/navigation.service';

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

  loading: boolean = false;

  constructor(
    public navService: NavigationService,
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get emailFormField() {
    return this.sendMailForm.get('email');
  }

  onSubmit() {
    if (this.sendMailForm.valid) {
      const { email } = this.sendMailForm.value;
      this.loading = true;
      this.restService.sendMail(email!).subscribe({
        next: (response) => {
          this.alertService.showAlert('Email sent successfully!', 'success');
          this.navService.login();
        },
        error: (err) => {
          this.errorService.handleSendMailError(err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}