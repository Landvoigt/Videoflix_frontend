import { Component } from '@angular/core';
import { fadeInPage } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss',
  animations: [fadeInPage]
})
export class PolicyComponent {
  closeMenu: boolean = false;

  constructor(public navService: NavigationService) { }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }
}