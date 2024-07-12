import { AfterViewInit, ApplicationRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild, inject} from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { RestService } from '../services/rest.service';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';
import { first } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

  videoUrl: string = '';
  posterUrls: string[] = [];
  videoUrls: string[] = [];
  videoData: { videoUrlGcs: string; posterUrlGcs: string }[] = [] ;
  @ViewChild('videoPlayerStart', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;
  @ViewChild('line1', { static: false }) line1: ElementRef;

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
    private restService: RestService,
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private videoService: VideoService,
    private renderer: Renderer2
  ) { }




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


  

  getResolution(): string {
    const width = window.innerWidth;
    if (width >= 1920) {
      return '1080p';
    } else if (width >= 1280) {
      return '720p';
    } else if (width >= 854) {
      return '480p';
    } else {
      return '360p';
    }
  }


  loadAllVideoUrls(): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;
  
    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
        //console.log('Fetched video URLs:', response.video_urls);
        this.videoUrls = response.video_urls;
        //console.log('Updated videoUrls:', this.videoUrls);
        this.setupVideoPlayer();
      },
      error: (error) => {
        console.error('Error fetching video URLs:', error);
      }
    });
  }


  getVideoUrl(videoKey: string, resolution: string): void {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
       // console.log('Response from server:', data);
        if (data && data.video_url) {
          this.videoUrl = data.video_url;  // Hauptvideo
          this.videoUrls.push(data.video_url);
         // console.log('Updated videoUrls:', this.videoUrls);
          this.setupVideoPlayer();
        } else {
          console.error('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
      }
    });
  }


  setupVideoPlayer() {
    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(this.videoUrl);
        hls.attachMedia(this.videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          //console.log('HLS manifest parsed');
          this.videoPlayer.nativeElement.play();
        });
      } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        this.videoPlayer.nativeElement.src = this.videoUrl;
        this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
          console.log('Native HLS support, video loaded');
          this.videoPlayer.nativeElement.play();
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
  }
 

  ngOnInit(): void {
    
    this.loadPosterUrls();
    this.getVideoUrl('kino', '360p');
    this.loadAllVideoUrls();
    //const resolution = this.getResolution();
    //console.log('Resolution: ', this.getResolution());
    this.loadVideoUrls();
   // console.log('videoData', this.videoData)
    //const lineIds = ['line1', 'line2', 'line3'];
   // lineIds.forEach(id => this.scrollElementById(id, 500));
    // this.videoService.hoverState$.subscribe(state => {
    //   this.isHovered = state;
    // });
  }


  ngAfterViewInit(): void {
   
  }

  loadVideoUrls(): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;
    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
       // console.log('Fetched video URLs:', response.video_urls);
        this.videoUrls = response.video_urls;
        this.createVideoData();
      },
      error: (error) => {
        console.error('Error fetching video URLs:', error);
      }
    });
  }


  createVideoData(): void {
    this.videoData = this.videoUrls.map((videoUrl, index) => ({
        videoUrlGcs: videoUrl || '/assets/img/barni/startvideo.png',
        posterUrlGcs: this.posterUrls[index] || '/assets/img/barni/am_gang.png'
    }));
}

  loadPosterUrls(): void {
    const apiUrl = 'http://localhost:8000/get_poster_urls/';

    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
       // console.log('Fetched poster URLs:', response.poster_urls);
        this.posterUrls = response.poster_urls;
      },
      error: (error) => {
        console.error('Error fetching poster URLs:', error);
      }
    });
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


  savePositions() {
    const outerContainer = this.line3.nativeElement;
    this.savedScrollLeft = outerContainer.scrollLeft;
    this.savedRelativePositions = Array.from(outerContainer.children).map((item: HTMLElement) => {
      const itemRect = item.getBoundingClientRect();
      const containerRect = outerContainer.getBoundingClientRect();
      return itemRect.left - containerRect.left + outerContainer.scrollLeft;
    });
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

  private isContainerScrollable(container: HTMLElement): boolean {
    return container.scrollWidth > container.clientWidth;
  }
}


