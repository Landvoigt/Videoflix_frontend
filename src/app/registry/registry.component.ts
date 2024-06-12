import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registry',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './registry.component.html',
  styleUrl: './registry.component.scss'
})
export class RegistryComponent {
  email: string = '';
  password1: string = '';
  password2: string = '';

  constructor(private router: Router) { }

  navigateBack() {
    this.router.navigate(['/login']);
  }

}