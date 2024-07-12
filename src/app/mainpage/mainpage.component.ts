import { AfterViewInit, Component, ElementRef, ViewChild, inject} from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { VideoService } from '../services/video.service';
import { VideoComponent } from '../video/video.component';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, VideoComponent],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss',
  animations: [fadeInPage]
})
export class MainpageComponent implements AfterViewInit {

elementRef = inject(ElementRef);
@ViewChild('videoPlayerStart', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;
@ViewChild('line3', { static: false }) line3: ElementRef;
savedScrollLeft = 0;
savedRelativePositions: number[] = [];
isScrollable = false;

currentPage: 'dashboard' | 'films' | 'series' | 'userList' = 'dashboard';
closeMenu: boolean = false;
///// ToDo make components for each page
allFilms: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
allSeries: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
userVideos: any[] = [1, 2, 3, 4, 5, 6];

 constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public videoService: VideoService,
  ) { }


 ngOnInit(): void { 
    this.videoService.loadPosterUrls();
    this.videoService.getVideoUrl(this.videoPlayer,'kino', '360p');
    this.videoService.loadAllVideoUrls(this.videoPlayer);   
  }


 ngAfterViewInit(): void {
    if (this.videoPlayer) {
      this.videoService.videoPlayer = this.videoPlayer;
      this.videoService.loadAllVideoUrls(this.videoPlayer);
    } else {
      console.error('Video player element is not available');
    }  
  }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }

  onPageChanged(page: 'dashboard' | 'films' | 'series' | 'userList') {
    this.currentPage = page;
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'userList') {
    return this.currentPage === page;
  }

  //// ToDo fix boolean active for profile
  goToProfiles() {
    let profileId = this.authService.getProfile().id;
    if (profileId) {
      //this.restService.updateProfile(profileId, { active: false })
      this.navService.profile();
    }
  }


  // getProfileImage() {
  //  return ProfileImages[this.authService.getProfile().avatar_id] || "/assets/svg/default_avatar.svg";
  // }


  private scrollElementById(id: string, scrollAmount: number): void {
    setTimeout(() => {
      const element: HTMLElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (element) {
        element.scrollLeft += scrollAmount;
      }
    }, 0);
  }


  toggleMode() {
    const outerContainer = this.line3.nativeElement;
    if (!this.isScrollable) {
      this.savedScrollLeft = outerContainer.scrollLeft;
      outerContainer.style.overflowX = 'visible';
      const screenWidth = outerContainer.offsetWidth;
      let previousPosition = 0;
      Array.from(outerContainer.children).forEach((item: HTMLElement, index: number) => {
        const originalRelativePosition = this.savedRelativePositions[index];
        let newLeft = originalRelativePosition - this.savedScrollLeft;
        
        if (index > 0 && !this.isContainerScrollable(outerContainer)) {
          newLeft = Math.min(newLeft, previousPosition);
        }
        
        item.style.position = 'relative';
        item.style.left = `${newLeft}px`;
        
        previousPosition = newLeft;
      });

    } else {
      outerContainer.style.overflowX = 'scroll';
      outerContainer.scrollLeft = this.savedScrollLeft;
      Array.from(outerContainer.children).forEach((item: HTMLElement) => {
        item.style.position = 'static';
        item.style.left = '0px';
      });

    }
    this.isScrollable = !this.isScrollable;
  }

  scrollingLeft3() {
    this.isScrollable = true;
    this. toggleMode();
    const outerContainer = this.line3.nativeElement;
    outerContainer.scrollLeft -= 700; 
  }

  scrollingRight3() {
    this.isScrollable = true;
    this.toggleMode();
    const outerContainer = this.line3.nativeElement;
    outerContainer.scrollLeft += 700; 
  }

  toVisibleModus3() {
    this.savePositions();
    this.isScrollable = false;
    this.toggleMode();
  }


  savePositions() {
    const outerContainer = this.line3.nativeElement;
    this.savedScrollLeft = outerContainer.scrollLeft;
    this.savedRelativePositions = Array.from(outerContainer.children).map((item: HTMLElement) => {
      const itemRect = item.getBoundingClientRect();
      const containerRect = outerContainer.getBoundingClientRect();
      return itemRect.left - containerRect.left + outerContainer.scrollLeft;
    });
  }

  private isContainerScrollable(container: HTMLElement): boolean {
    return container.scrollWidth > container.clientWidth;
  }
}


