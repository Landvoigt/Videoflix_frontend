import { AfterViewInit,ChangeDetectorRef, Component, ElementRef, HostListener, Output, Renderer2, ViewChild, inject, output } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { VideoService } from '../services/video.service';
import { VideoComponent } from '../video/video.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilmsComponent } from '../categories/films/films.component';
import { SeriesComponent } from '../categories/series/series.component';
import { PlaylistComponent } from '../categories/playlist/playlist.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import Hls from 'hls.js';
import { Observable } from 'rxjs';
import { EventEmitter } from 'stream';

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
  @ViewChild('videoPlayerMain', { static: false }) videoPlayerMain: ElementRef<HTMLVideoElement>;
  @ViewChild('line1', { static: false }) line1: ElementRef;
  @ViewChild('line2', { static: false }) line2: ElementRef;
  savedScrollLeft = 0;
  savedScrollLeft2 = 0;
  savedRelativePositions: number[] = [];
  savedRelativePositions2: number[] = [];
  isScrollable = false;
  title: string;
  description: string;
  category: string;
  videoDataGcs: VideoData[] = []; 
  line1Videos: VideoData[] = [];    // für später, wenn wir  über 10 Videos haben
  line2Videos: VideoData[] = [];    // für später, wenn wir  über 10 Videos haben
  videoUrl: string = '';
  isFullscreen: boolean = false;
  hls: Hls | null = null; 
  posterUrlGcs: string = '';
  currentVideo:string;
  pageChangedSetTime:any;
  startRandomVideoSetTime:any;

  leftmostId: string;
  leftmostId2: string;
  rightmostId: string;
  rightmostId2: string;
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
     this.startRandomVideoSetTime = setTimeout(() => {
         this.savePositions();
         this.savePositions2();
         this.getRandomVideoData();
         this.isPosterImg = false;
     },3000);
     this.videoService.fetchAndStoreVideoData();
     this.videoService.logWindowSize();
     setTimeout(() => {
         this.adjustChildClass(window.innerWidth); // ab 600px
      }, 2000);
      document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
     }
    


    ngAfterViewInit(): void {
     this.videoService.getStoredVideoData().subscribe(data => {
     this.videoDataGcs = data;
    // this.line1Videos = this.videoDataGcs.slice(0, 10);  // für später
    // this.line2Videos = this.videoDataGcs.slice(10);     // für später
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
      this.scrollingLeft2();  // !!
      this.toVisibleModus2();  // !!
      if(this.onHoverVideo) {
        if(id === this.leftmostId  || id === this.leftmostId2 ) {this.changeChildStylesLeft(id);}
        if( id === this.rightmostId  || id === this.rightmostId2) {this.changeChildStylesRight(id);}
      } 
    }


    shouldHandleEvent(id: string): boolean {
      return !this.disableEvents || this.activeVideoId === id;
    }


    onLeave(id:string) {  
     this.layover();
      if (this.activeVideoId === id) {
        this.activeVideoId = null;
      }
      this.disableEvents = true;
      setTimeout(() => {
        this.disableEvents = false;
      }, 100);
      if(id === this.leftmostId || id === this.leftmostId2 ) {this.changeBackChildStylesLeft(id);}
      if(id ===  this.rightmostId || id ===  this.rightmostId2) {this.changeBackChildStylesRight(id);}
    this.onHoverVideo = false;
    setTimeout(() => {
      this.onHoverVideo = true;
    }, 100);
   }


   layover() {
    let layover = document.getElementById('layoverMainpage');
    layover.style.display = "block" ; 
    setTimeout(() => {
      layover.style.display = "none" ; 
    }, 500); 
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
    this.pageChangedSetTime = setTimeout(() => {
        this.savePositions();
        this.savePositions2();
        this.getRandomVideoData();
        this.isPosterImg = false;
      }, 1);    
   }else {
    clearTimeout(this.pageChangedSetTime);
    clearTimeout(this.startRandomVideoSetTime);
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


  toggleMode2() {
   const outerContainer = this.line2.nativeElement;
    if (!this.isScrollable) {
      this.savedScrollLeft = outerContainer.scrollLeft;
      outerContainer.style.overflowX = 'visible';
      const screenWidth = outerContainer.offsetWidth;
      let previousPosition = 0;
      Array.from(outerContainer.children).forEach((item: HTMLElement, index: number) => {
        const originalRelativePosition = this.savedRelativePositions2[index];
        let newLeft = originalRelativePosition - this.savedScrollLeft2;

        if (index > 0 && !this.isContainerScrollable(outerContainer)) {
          newLeft = Math.min(newLeft, previousPosition);
        }

        item.style.position = 'relative';
        item.style.left = `${newLeft}px`;

        previousPosition = newLeft;
      });

    } else {
      outerContainer.style.overflowX = 'scroll';
      outerContainer.scrollLeft = this.savedScrollLeft2;
      Array.from(outerContainer.children).forEach((item: HTMLElement) => {
        item.style.position = 'static';
        item.style.left = '0px';
      });

    }
    this.isScrollable = !this.isScrollable;
  }



  scrollingLeft2() {
    this.isScrollable = true;
    this.toggleMode2();
    const outerContainer = this.line2.nativeElement;
    outerContainer.scrollLeft -= 700;
  }


  scrollingRight2() {
    this.isScrollable = true;
    this.toggleMode2();
    const outerContainer = this.line2.nativeElement;
    outerContainer.scrollLeft += 700;
  }


  toVisibleModus2() {
    this.savePositions2();
    this.isScrollable = false;
    this.toggleMode2();
  }


   private isContainerScrollable(container: HTMLElement): boolean {
     return container.scrollWidth > container.clientWidth;
   }


  savePositions() {
    if(window.innerWidth > 600) {
      const outerContainer = this.line1.nativeElement;
      this.savedScrollLeft = outerContainer.scrollLeft;
      const children = Array.from(outerContainer.children) as HTMLElement[];
      let leftmostPosition = Number.POSITIVE_INFINITY;
      let rightmostPosition = Number.NEGATIVE_INFINITY;
      let leftmostElement: HTMLElement | null = null;
      let rightmostElement: HTMLElement | null = null;
    
      const containerRect = outerContainer.getBoundingClientRect();
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
          if (position > rightmostPosition){
            rightmostPosition = position;
            rightmostElement = item;
            this.rightmostId = item.id;
            this.positionRightMostVideo(this.rightmostId);
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
  


  savePositions2() {
    if(window.innerWidth > 600) {
      const outerContainer = this.line2.nativeElement;
      this.savedScrollLeft2 = outerContainer.scrollLeft;
      const children = Array.from(outerContainer.children) as HTMLElement[];
      let leftmostPosition = Number.POSITIVE_INFINITY;
      let rightmostPosition = Number.NEGATIVE_INFINITY;
      let leftmostElement: HTMLElement | null = null;
      let rightmostElement: HTMLElement | null = null;
    
      const containerRect = outerContainer.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;
    
      this.savedRelativePositions2 = children.map((item) => {
        const itemRect = item.getBoundingClientRect();
        const position = itemRect.left - containerLeft + outerContainer.scrollLeft;
        const isVisible = itemRect.left < containerRight && itemRect.right > containerLeft;
        if (isVisible) {
          if (position < leftmostPosition) {
            leftmostPosition = position;
            leftmostElement = item;
            this.leftmostId2 = item.id;
            this.positionLeftMostVideo( this.leftmostId2);
   
          }
          if (position > rightmostPosition){
            rightmostPosition = position;
            rightmostElement = item;
            this.rightmostId2 = item.id;
            this.positionRightMostVideo(this.rightmostId2);
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
    }}   
  
  

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
     const elementRect = childElement.getBoundingClientRect();
    if (childElement  && 
      elementRect.right > window.innerWidth || (window.innerWidth - elementRect.right) < 30) {
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
          this.setupVideoPlayer(videoKey);
        } else {
          console.error('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
      }
    });
  }
  
 
  setupVideoPlayer(videoKey:string): void {
    this.currentVideo = videoKey;
    const video: HTMLVideoElement = this.videoPlayerMain.nativeElement;
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
    const video: HTMLVideoElement = this.videoPlayerMain.nativeElement;
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


  createMyFilms(fileName: string): Observable<any> {
    const apiUrl = 'http://localhost:8000/my-films/';
    const body = { file_name: fileName };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(apiUrl, body, { headers });
  }

 
onFullscreenChange(): void {
  if (this.isFullscreenChanged()) {

 this.createMyFilms(this.currentVideo).subscribe({
      next: (response) => {
        console.log('Antwort vom Backend:', response);
      },
      error: (error) => {
        console.error('Fehler bei der Anfrage:', error);
      }
    });
   // console.log('Das Dokument ist im Fullscreen-Modus.');
  } else {
    //console.log('Das Dokument ist nicht im Fullscreen-Modus.');
  }
}


isFullscreenChanged(): boolean {
  return !!document.fullscreenElement;
}


}
