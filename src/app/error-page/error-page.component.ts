import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInPage } from '../utils/animations';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
  animations: [fadeInPage]

})
export class ErrorPageComponent {

  constructor(
    private router: Router,
    private location: Location) { }
    
  navigateBack() {
    this.location.back();
  }
}
