import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [],
  templateUrl: './register-success.component.html',
  styleUrl: './register-success.component.scss',
  animations: [fadeInPage]
})
export class RegisterSuccessComponent {

  constructor(
    private router: Router) { }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}