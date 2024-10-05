import { Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { NavigationService } from '@services/navigation.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.scss'
})
export class FrontpageComponent {
  loading: boolean = true;
  loggedIn: boolean = false;

  constructor(private authService: AuthService, public navService: NavigationService) {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.authService.isLoggedIn().pipe(take(1)).subscribe((isLoggedIn: boolean) => {
      this.loggedIn = isLoggedIn;
      this.loading = false;
    });
  }
}