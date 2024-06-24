import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-success.component.html',
  styleUrl: './register-success.component.scss',
  animations: [fadeInPage]
})
export class RegisterSuccessComponent {

  constructor(
    private location: Location) { }

  navigateBack() {
    this.location.back();
  }
}