import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.scss'
})
export class FrontpageComponent {
  loggedIn: boolean = false;
  loading: boolean = true;

  constructor(private router: Router, private authService: AuthService, public navService: NavigationService) {
    this.loggedIn = this.authService.isLoggedIn();
    this.loading = false;
  }
}