import { Component, ElementRef, inject } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { RestService } from '../services/rest.service';
import { ProfileImages } from '../../models/profile.model';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss',
  animations: [fadeInPage]
})
export class MainpageComponent {

  elementRef = inject(ElementRef);

  currentPage: 'dashboard' | 'films' | 'series' | 'userList' = 'dashboard';
  userMenuOpen: boolean = false;
  mobileMenuOpen: boolean = false;
  
  ///// ToDo make components for each page
  allFilms: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  allSeries: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  userVideos: any[] = [1, 2, 3, 4, 5, 6];

  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    private restService: RestService) { }


  ngOnInit(): void {
    const lineIds = ['line1', 'line2', 'line3'];
    lineIds.forEach(id => this.scrollElementById(id, 500));
  }


  //// ToDo fix boolean active for profile
  goToProfiles() {
    let profileId = this.authService.getProfile().id;
    if (profileId) {
      // this.restService.updateProfile(profileId, { active: false })
      this.navService.profile();
    }
  }

  getProfileImage() {
    return ProfileImages[this.authService.getProfile().avatar_id] || "/assets/svg/default_avatar.svg";
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

  changePage(page: 'dashboard' | 'films' | 'series' | 'userList') {
    this.currentPage = page;
    this.closeUserMenu();
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'userList') {
    return this.currentPage === page;
  }

  private scrollElementById(id: string, scrollAmount: number): void {
    setTimeout(() => {
      const element: HTMLElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (element) {
        element.scrollLeft += scrollAmount;
      }
    }, 0);
  }


  scrollingRight1() {
    const line1Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line1');
    if (line1Element) {
      line1Element.scrollLeft += 700;
    }
  }


  scrollingLeft1() {
    const line1Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line1');
    if (line1Element) {
      line1Element.scrollLeft += -700;
    }
  }


  scrollingRight2() {
    const line2Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line2');
    if (line2Element) {
      line2Element.scrollLeft += 700;
    }
  }


  scrollingLeft2() {
    const line2Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line2');
    if (line2Element) {
      line2Element.scrollLeft += -700;
    }
  }



  scrollingRight3() {
    const line3Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line3');
    if (line3Element) {
      line3Element.scrollLeft += 700;
    }
  }


  scrollingLeft3() {
    const line3Element: HTMLElement = this.elementRef.nativeElement.querySelector('#line3');
    if (line3Element) {
      line3Element.scrollLeft += -700;
    }
  }


}


