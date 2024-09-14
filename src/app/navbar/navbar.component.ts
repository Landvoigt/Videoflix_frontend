import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Profile, ProfileImages } from '../../models/profile.model';
import { NavigationService } from '@services/navigation.service';
import { fadeIn } from '@utils/animations';
import { Subscription } from 'rxjs';
import { ProfileService } from '@services/profile.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  animations: [fadeIn]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() closeMenu: boolean = false;
  @Input() currentPage: 'dashboard' | 'films' | 'series' | 'playlist';
  @Output() pageChanged: EventEmitter<'dashboard' | 'films' | 'series' | 'playlist'> = new EventEmitter<'dashboard' | 'films' | 'series' | 'playlist'>();

  userMenuOpen: boolean = false;
  mobileMenuOpen: boolean = false;

  currentProfile: Profile | null = null;
  private profileSubscription: Subscription = new Subscription();

  constructor(public authService: AuthService, public navService: NavigationService, public profileService: ProfileService) { }

  ngOnInit(): void {
    this.setupProfileListener();
  }

  ngOnChanges() {
    if (this.closeMenu) {
      this.closeUserMenu();
      this.closeMobileMenu();
    }
  }

  setupProfileListener() {
    this.profileSubscription.add(
      this.profileService.currentProfile$.subscribe((profile: Profile) => {
        this.currentProfile = profile;
      })
    );
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

  goToProfiles() {
    this.navService.profiles();
  }

  getProfileImage(): string {
    return this.currentProfile && this.currentProfile.avatar_id
      ? ProfileImages[this.currentProfile.avatar_id] || "/assets/svg/default_avatar.svg"
      : "/assets/svg/default_avatar.svg";
  }

  ngOnDestroy(): void {
    this.profileSubscription.unsubscribe();
  }
}