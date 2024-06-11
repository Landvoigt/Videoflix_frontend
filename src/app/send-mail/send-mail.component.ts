import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [],
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.scss'
})
export class SendMailComponent {

  constructor(private router: Router) { }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}
