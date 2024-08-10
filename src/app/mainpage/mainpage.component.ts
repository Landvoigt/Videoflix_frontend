import { AfterViewInit,ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild, inject } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { VideoService } from '../services/video.service';
import { VideoComponent } from '../video/video.component';
import { HttpClient } from '@angular/common/http';
import { FilmsComponent } from '../categories/films/films.component';
import { SeriesComponent } from '../categories/series/series.component';
import { PlaylistComponent } from '../categories/playlist/playlist.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import Hls from 'hls.js';

export interface VideoData {
  subfolder: string;
  description: string;
  title: string;
  posterUrlGcs?: string; 
  category: string;
}

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, LoadingScreenComponent, NavbarComponent, FooterComponent, VideoComponent, FilmsComponent, SeriesComponent, PlaylistComponent],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss',
  animations: [fadeInPage],
})
export class MainpageComponent implements AfterViewInit {

  elementRef = inject(ElementRef);
  @ViewChild('videoPlayerMain', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;
  @ViewChild('line1', { static: false }) line1: ElementRef;
  @ViewChild('line2', { static: false }) line2: ElementRef;
  savedScrollLeft = 0;
  savedRelativePositions: number[] = [];
  isScrollable = false;
  title: string;
  description: string;
  category: string;
  videoDataGcs: VideoData[] = []; 
  videoUrl: string = '';
  isFullscreen: boolean = false;
  hls: Hls | null = null; 
  posterUrlGcs: string = '';

  leftmostId: string;
  rightmostId: string;
  onHoverVideo:boolean = true;
  activeVideoId: string | null = null;
  disableEvents = false;
  videoCurrentTime = 0;
  isPosterImg:boolean = true;


  loadingApp: boolean = true;

  currentPage: 'dashboard' | 'films' | 'series' | 'playlist' = 'dashboard';
  closeMenu: boolean = false;

  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public videoService: VideoService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2

    ) { }



    ngOnInit(): void {
      this.loadingApp = true;
      setTimeout(() => {
         this.savePositions();
         this.getRandomVideoData();
         this.isPosterImg = false;
     },3000);
     this.videoService.fetchAndStoreVideoData();
     this.videoService.logWindowSize();
     setTimeout(() => {
         this.adjustChildClass(window.innerWidth); // ab 600px
      }, 2000);
     }




    ngAfterViewInit(): void {
     this.videoService.getStoredVideoData().subscribe(data => {
     this.videoDataGcs = data;
     console.log('Processed video data in MainPageComponent:', this.videoDataGcs);
    });
  
    }


    onHover(id:string) {
      if (this.disableEvents) {
        return;
      }
      this.activeVideoId = id;
      this.disableEvents = true;
        setTimeout(() => {
        this.disableEvents = false;
      }, 100);
      this.scrollingLeft1();  // !!
      this.toVisibleModus1();  // !!
      if(this.onHoverVideo) {
        if(id === this.leftmostId) {this.changeChildStylesLeft(id);}
        if( id === this.rightmostId) {this.changeChildStylesRight(id);}
      } 
    }


    shouldHandleEvent(id: string): boolean {
      return !this.disableEvents || this.activeVideoId === id;
    }


    onLeave(id:string) {  
      let layover = document.getElementById('layoverMainpage');
      layover.style.display = "block" ; 
      setTimeout(() => {
        layover.style.display = "none" ; 
      }, 800); 
      if (this.activeVideoId === id) {
        this.activeVideoId = null;
      }
      this.disableEvents = true;
      setTimeout(() => {
        this.disableEvents = false;
      }, 100);

      if(id === this.leftmostId) {this.changeBackChildStylesLeft(id);}
      if(id ===  this.rightmostId) {this.changeBackChildStylesRight(id);}
    this.onHoverVideo = false;
    setTimeout(() => {
      this.onHoverVideo = true;
    }, 100);
   }
   
  
    changeChildStylesLeft(id:string) { 
      const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (childElement) {
       this.renderer.addClass(childElement, 'transition-slow');
       this.renderer.setStyle(childElement, 'transform', `translateX(${this.positionLeftMostVideo(id)}px)`);
       this.renderer.setStyle(childElement, 'z-index', '1000');
      }
    }


    changeChildStylesRight(id:string) { 
      const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (childElement) {
       this.renderer.addClass(childElement, 'transition-slow');
       this.renderer.setStyle(childElement, 'transform', `translateX(${this.positionRightMostVideo(id)}px)`);
       this.renderer.setStyle(childElement, 'z-index', '1000');
      }
    }


    changeBackChildStylesLeft(id:string) {
      const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (childElement) {
        this.renderer.addClass(childElement, 'transition-slow');
        this.renderer.setStyle(childElement, 'transform', 'translateX(0)');
        this.renderer.setStyle(childElement, 'z-index', '100');
      }
    }


    changeBackChildStylesRight(id:string) {
      const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
      if (childElement) {
        this.renderer.addClass(childElement, 'transition-slow');
        this.renderer.setStyle(childElement, 'transform', 'translateX(0)');
        this.renderer.setStyle(childElement, 'z-index', '100');
      }
    }


  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }


  onPageChanged(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    this.currentPage = page;
    if(this.currentPage ==='dashboard') {
      this.isPosterImg = true;
      setTimeout(() => {
        this.isPosterImg = false;
        this.getRandomVideoData();
      }, 3000);    
   }
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
    const outerContainer = this.line1.nativeElement;
   // const outerContainer2 = this.line2.nativeElement;
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


  scrollingLeft1() {
    this.isScrollable = true;
    this.toggleMode();
    const outerContainer = this.line1.nativeElement;
    outerContainer.scrollLeft -= 700;
  }


  scrollingRight1() {
    this.isScrollable = true;
    this.toggleMode();
    const outerContainer = this.line1.nativeElement;
    outerContainer.scrollLeft += 700;
  }


  toVisibleModus1() {
    this.savePositions();
    this.isScrollable = false;
    this.toggleMode();
  }


   private isContainerScrollable(container: HTMLElement): boolean {
     return container.scrollWidth > container.clientWidth;
   }


  savePositions() {
    if(window.innerWidth > 600) {
      const outerContainer = this.line1.nativeElement;
      this.savedScrollLeft = outerContainer.scrollLeft;
      const children = Array.from(outerContainer.children) as HTMLElement[];
      console.log('const children',children);
      let leftmostPosition = Number.POSITIVE_INFINITY;
      let rightmostPosition = Number.NEGATIVE_INFINITY;
      let leftmostElement: HTMLElement | null = null;
      let rightmostElement: HTMLElement | null = null;
    
      const containerRect = outerContainer.getBoundingClientRect();
      console.log('const containerRect = outerContainer.getBoundingClientRect();',containerRect);
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;
    
      this.savedRelativePositions = children.map((item) => {
        const itemRect = item.getBoundingClientRect();
        const position = itemRect.left - containerLeft + outerContainer.scrollLeft;
    
        const isVisible = itemRect.left < containerRight && itemRect.right > containerLeft;
        if (isVisible) {
          if (position < leftmostPosition) {
            leftmostPosition = position;
            leftmostElement = item;
            this.leftmostId = item.id;
            this.positionLeftMostVideo( this.leftmostId);
   
          }
          if (position > rightmostPosition) {
            rightmostPosition = position;
            rightmostElement = item;
            this.rightmostId = item.id;
            this.positionRightMostVideo( this.rightmostId);
          }
        }
    
        return position;
      });
    
      if (leftmostElement) {
        const posterImg = leftmostElement.querySelector('#posterImg') as HTMLImageElement;
        const leftmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
      } else {
      }
    
      if (rightmostElement) {
        const posterImg = rightmostElement.querySelector('#posterImg') as HTMLImageElement;
        const rightmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
      } else {
      }
    }    
  }
  

  positionLeftMostVideo(id: string): number {
    const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
    if (childElement) {
      const elementRect = childElement.getBoundingClientRect();
      const elementXPosition = elementRect.x;
      return (elementXPosition * -1) + 30;
    }
    return 0;
  }
  

  positionRightMostVideo(id: string): number {
    const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
    if (childElement) {
      const elementRect = childElement.getBoundingClientRect();
      const elementXPosition = elementRect.x;
      const elementWidth = elementRect.width;
      const displayWidth = window.innerWidth;
      const rightmostXPosition = elementWidth - (displayWidth - elementXPosition) ;
      return (rightmostXPosition * -1) - 80;
    }
    return 0;
  }
  

  getRandomVideoData(): void{
    if (this.videoDataGcs.length === 0) {
      console.error('No video data available');
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.videoDataGcs.length);
    const randomVideoData = this.videoDataGcs[randomIndex];
    this.title = randomVideoData.title;
    this.description = randomVideoData.description;
    this.posterUrlGcs = randomVideoData.posterUrlGcs;
    this.getVideoUrl(randomVideoData.subfolder,this.getResolutionForVideoElement());
  }
  

  getVideoUrl(videoKey: string, resolution: string): void {
    const apiUrl = `http://localhost:8000/preview-video/?video_key=${videoKey}&resolution=${resolution}`;
    this.http.get<{ video_url: string }>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          this.videoUrl = data.video_url;
          this.cdr.detectChanges();
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
  

  setupVideoPlayer(): void {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    if (Hls.isSupported()) {
      if (this.hls) {
        this.hls.destroy();
      }
      this.hls = new Hls();
      this.hls.loadSource(this.videoUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        setTimeout(() => {
            this.isPosterImg = true;
        }, 28000); 
        const maxDuration = 30;
        video.addEventListener('timeupdate', () => {
          if (video.currentTime >= maxDuration) {
            video.pause();
            video.currentTime = 0;
            this.isPosterImg = true;
          }
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        const maxDuration = 30;
        video.addEventListener('timeupdate', () => {
          if (video.currentTime >= maxDuration) {
            video.pause();
            video.currentTime = 0;
          }
        });
      });
    } else {
      console.error('HLS not supported');
    }
  }


  getResolutionForVideoElement(): string {
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    const width = video.clientWidth;

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

 


  extractFilename(url: string): string {
    const segments = url.split('/');
    const filename = segments[segments.length - 2];
    return filename;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.videoService.logWindowSize();
    this.adjustChildClass(window.innerWidth);
  }


  public adjustChildClass(width: number) {
    const childElements = this.elementRef.nativeElement.querySelectorAll('.videoInMainpage');
    childElements.forEach((childElement: HTMLElement) => {
      if (childElement) {
        if (width < 600) {
          this.renderer.addClass(childElement, 'video-size');
        } else {
          this.renderer.removeClass(childElement, 'video-size');
        }
      } else {
        console.warn('childElement is undefined or null');
      }
    });
  }
 

}


