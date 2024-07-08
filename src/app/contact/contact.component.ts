import { Component } from '@angular/core';
import { fadeInPage } from '../utils/animations';
import { NavigationService } from '../services/navigation.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactFormModel } from '../interfaces/contact.interface';
import { CompanyNameRegex, EmailRegex, NameRegex } from '../utils/regex';
import { AlertService } from '../services/alert.service';
import { RestService } from '../services/rest.service';
import { ErrorService } from '../services/error.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [fadeInPage]
})
export class ContactComponent {

  public contactForm: FormGroup<ContactFormModel> = new FormGroup<ContactFormModel>(
    {
      firstName: new FormControl(null, [Validators.required, Validators.pattern(NameRegex)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(NameRegex)]),
      company: new FormControl(null, [Validators.pattern(CompanyNameRegex)]),
      email: new FormControl(null, [Validators.required, Validators.pattern(EmailRegex)]),
      message: new FormControl(null, [Validators.required]),
    }
  );

  loading: boolean = false;
  closeMenu: boolean = false;

  constructor(
    public navService: NavigationService,
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get firstNameFormField() {
    return this.contactForm.get('firstName');
  }

  get lastNameFormField() {
    return this.contactForm.get('lastName');
  }

  get companyFormField() {
    return this.contactForm.get('company');
  }

  get emailFormField() {
    return this.contactForm.get('email');
  }

  get messageFormField() {
    return this.contactForm.get('message');
  }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const { firstName, lastName, company, email, message } = this.contactForm.value;
      this.loading = true;
      this.restService.contact(firstName!, lastName!, company!, email!, message!).subscribe({
        next: (response) => {
          this.alertService.showAlert('Thank you for your message!', 'success');
          this.contactForm.reset();
        },
        error: (err) => {
          this.errorService.handleContactError(err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}