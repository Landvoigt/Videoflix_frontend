import { Component } from '@angular/core';
import { fadeInPage } from '../utils/animations';
import { NavigationService } from '../services/navigation.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [fadeInPage]
})
export class ContactComponent {

  loading: boolean = false;
  closeMenu: boolean = false;

  constructor(public navService: NavigationService) { }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 0);
  }
}
