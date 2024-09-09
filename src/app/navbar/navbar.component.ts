import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProfileImages } from '../../models/profile.model';
import { AuthService } from '../auth/auth.service';
import { NavigationService } from '@services/navigation.service';
import { fadeInPage } from '@utils/animations';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  animations: [fadeInPage]
})
export class NavbarComponent {
  @Input() closeMenu: boolean = false;
  @Output() pageChanged: EventEmitter<'dashboard' | 'films' | 'series' | 'playlist'> = new EventEmitter<'dashboard' | 'films' | 'series' | 'playlist'>();

  @Input() currentPage: 'dashboard' | 'films' | 'series' | 'playlist';
  userMenuOpen: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    public navService: NavigationService,
    public authService: AuthService
  ) { }

  ngOnChanges() {
    if (this.closeMenu) {
      this.closeUserMenu();
      this.closeMobileMenu();
    }
  }

  getProfileImage() {
    const profile = this.authService.getProfile();
    if (profile && profile.avatar_id) {
      return ProfileImages[profile.avatar_id] || "/assets/svg/default_avatar.svg";
    } else {
      return "/assets/svg/default_avatar.svg";
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  changePage(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    this.navService.main();
    this.closeUserMenu();
    this.currentPage = page;
    localStorage.setItem('currentPage', page);
    this.pageChanged.emit(page);
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    return this.currentPage === page;
  }

  //// ToDo fix boolean active for profile
  goToProfiles() {
    let profileId = this.authService.getProfile().id;
    if (profileId) {
      // this.restService.updateProfile(profileId, { active: false })
      this.navService.profiles();
    }
  }
}