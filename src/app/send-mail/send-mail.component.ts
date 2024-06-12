import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss'
})
export class SendMailComponent {
  email: string = '';

  constructor(private router: Router) { }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}