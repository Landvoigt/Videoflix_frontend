import { AfterViewInit, Component, ElementRef, Output, ViewChild, inject } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { VideoService } from '../services/video.service';
import { VideoComponent } from '../video/video.component';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FilmsComponent } from '../categories/films/films.component';
import { SeriesComponent } from '../categories/series/series.component';
import { PlaylistComponent } from '../categories/playlist/playlist.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';

export interface VideoData {
  subfolder: string;
  description: string;
  title: string;
  posterUrlGcs?: string; 
}

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, LoadingScreenComponent, NavbarComponent, FooterComponent, VideoComponent, FilmsComponent, SeriesComponent, PlaylistComponent],
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
  title: string;
  description: string;
  videoDataGcs: VideoData[] = []; // NEU

  loadingApp: boolean = false;

  currentPage: 'dashboard' | 'films' | 'series' | 'playlist' = 'dashboard';
  closeMenu: boolean = false;

  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public videoService: VideoService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadingApp = true;
    // this.videoService.loadPosterUrls();
    // this.videoService.loadAllVideoUrls(this.videoPlayer);
    // this.videoService.loadGcsData();
    this.videoService.getVideoData().subscribe(data => {
      this.videoDataGcs = data.gcs_video_text_data.map((item: any) => {
        const posterUrl = data.poster_urls.find((url: string) => url.includes(item.subfolder));
        return {
          subfolder: item.subfolder,
          title: item.title,
          description: item.description,
          posterUrlGcs: posterUrl
        };
      });
      console.log('Processed video data:', this.videoDataGcs);
    }, error => {
      console.error('Error fetching video data:', error);
    });
   }


  ngAfterViewInit(): void {
    // if (this.videoPlayer) {
    //   this.videoService.videoPlayer = this.videoPlayer;
    // } else {
    //   console.error('Video player element is not available');
    // }
  }

  
  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }

  onPageChanged(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    this.currentPage = page;
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    return this.currentPage === page;
  }

  //// ToDo fix boolean active for profile
  goToProfiles() {
    let profileId = this.authService.getProfile().id;
    if (profileId) {
      //this.restService.updateProfile(profileId, { active: false })
      this.navService.profiles();
    }
  }

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
    this.toggleMode();
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


