import { Component } from '@angular/core';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UpdateUsernameFormModel } from '../interfaces/auth.interface';
import { AlertService } from '../services/alert.service';
import { ErrorService } from '../services/error.service';
import { NavigationService } from '../services/navigation.service';
import { RestService } from '../services/rest.service';

@Component({
  selector: 'app-update-username',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update-username.component.html',
  styleUrl: './update-username.component.scss',
  animations: [fadeInPage]
})
export class UpdateUsernameComponent {
  public updateUsernameForm: FormGroup<UpdateUsernameFormModel> = new FormGroup<UpdateUsernameFormModel>(
    {
      username: new FormControl(null, [Validators.required]),
    }
  );

  loading: boolean = false;

  constructor(
    public navService: NavigationService,
    private restService: RestService,
    private errorService: ErrorService,
    private alertService: AlertService) { }

  get usernameFormField() {
    return this.updateUsernameForm.get('username');
  }

  onSubmit() {
    if (this.updateUsernameForm.valid) {
      const { username } = this.updateUsernameForm.value;
      this.loading = true;
      this.restService.updateUsername(username!).subscribe({
        next: () => {
          this.alertService.showAlert('Username updated successfully!', 'success');
          this.navService.profiles();
        },
        error: (err) => {
          this.errorService.handleUpdateUsernameError(err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}