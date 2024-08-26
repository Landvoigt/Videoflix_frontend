import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '@interfaces/video.interface';
import { VideoComponent } from '@video/video.component';
import { Observable } from 'rxjs';
import { NavigationService } from '@services/navigation.service';
import { VideoService } from '@services/video.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  randomVideo$: Observable<VideoData | undefined>;
  videos$: Observable<VideoData[]>;
  loading: boolean = false;
  private userInteractionBound: boolean = false;
  videoUrl: string = '';
  @ViewChild('videoPlayerMain', { static: true }) videoPlayerMain!: ElementRef<HTMLVideoElement>;

  @ViewChild('line1', { static: false }) line1: ElementRef;
  savedScrollLeft: number = 0;
  savedRelativePositions: number[] = [];
  isScrollable: boolean = false;
  isFullscreen: boolean = false;
  leftmostId: string = '';
  rightmostId: string = '';
  onHoverVideo: boolean = true;
  activeVideoId: string | null = null;
  disableEvents: boolean = false;

  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public videoService: VideoService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2) { }


  ngOnInit(): void {
    this.bindUserInteraction();
    this.getRandomVideo();
    this.getVideoData();
  }

  ngAfterViewInit(): void {
    // this.savePositions(this.line1, this.savedScrollLeft, this.savedRelativePositions, 'leftmostId', 'rightmostId');
  }

  getRandomVideo(): void {
    this.randomVideo$ = this.videoService.getRandomVideoData();
    this.randomVideo$.subscribe({
      next: (video: VideoData | undefined) => {
        if (video) {
          this.getVideoUrl(video.subfolder, this.videoService.getVideoElementResolution(this.videoPlayerMain.nativeElement));
        } else {
          console.log('No video data available');
        }
      },
      error: (error) => {
        console.error('Error getting random video:', error);
      }
    });
  }

  getVideoUrl(videoKey: string, resolution: string): void {
    this.videoService.getVideoUrl(videoKey, resolution).subscribe({
      next: (url: string) => {
        this.videoUrl = url;
        this.cdr.detectChanges();
        this.playRandomVideo(videoKey);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  getVideoData(): void {
    this.loading = true;
    this.videos$ = this.videoService.getVideoData(null);
    this.videos$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.loading = false;
      }
    });
  }

  playRandomVideo(videoKey: string): void {
    this.videoService.currentVideo = videoKey;
    this.videoService.playRandomVideo(this.videoPlayerMain, this.videoUrl);
  }

  private savePositions(containerRef: ElementRef, savedScrollLeft: number, savedRelativePositions: number[], leftmostIdRef: string, rightmostIdRef: string): void {
    if (!containerRef) return;

    const container = containerRef.nativeElement as HTMLElement;
    if (window.innerWidth > 600 && container) {
      const children = Array.from(container.children) as HTMLElement[];
      let leftmostPosition = Number.POSITIVE_INFINITY;
      let rightmostPosition = Number.NEGATIVE_INFINITY;
      let leftmostElement: HTMLElement | null = null;
      let rightmostElement: HTMLElement | null = null;

      const containerRect = container.getBoundingClientRect();
      const containerLeft = containerRect.left;
      const containerRight = containerRect.right;

      savedRelativePositions.length = 0;

      children.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const position = itemRect.left - containerLeft + container.scrollLeft;
        const isVisible = itemRect.left < containerRight && itemRect.right > containerLeft;

        if (isVisible) {
          if (position < leftmostPosition) {
            leftmostPosition = position;
            leftmostElement = item;
            this[leftmostIdRef] = item.id;
          }
          if (position > rightmostPosition) {
            rightmostPosition = position;
            rightmostElement = item;
            this[rightmostIdRef] = item.id;
          }
        }

        savedRelativePositions.push(position);
      });

      this.handlePosterImages(leftmostElement, rightmostElement);
    }
  }

  private handlePosterImages(leftmostElement: HTMLElement | null, rightmostElement: HTMLElement | null): void {
    if (leftmostElement) {
      const posterImg = leftmostElement.querySelector('#posterImg') as HTMLImageElement;
      const leftmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
      console.log('Leftmost Poster URL:', leftmostPosterUrl);
    }

    if (rightmostElement) {
      const posterImg = rightmostElement.querySelector('#posterImg') as HTMLImageElement;
      const rightmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
      console.log('Rightmost Poster URL:', rightmostPosterUrl);
    }
  }

  private positionLeftMostVideo(id: string) {
    // return this.calculatePosition(id, false);
  }

  private positionRightMostVideo(id: string) {
    // return this.calculatePosition(id, true);
  }

  private calculatePosition(containerRef: ElementRef, isRightmost: boolean): number {
    const childElement = containerRef.nativeElement as HTMLElement;
    if (childElement) {
      const elementRect = childElement.getBoundingClientRect();
      const elementXPosition = elementRect.x;
      const displayWidth = window.innerWidth;

      if (isRightmost) {
        if (elementRect.right > displayWidth || (displayWidth - elementRect.right) < 30) {
          const elementWidth = elementRect.width;
          const rightmostXPosition = elementWidth - (displayWidth - elementXPosition);
          return (rightmostXPosition * -1) - 80;
        }
      } else {
        return (elementXPosition * -1) + 30;
      }
    }
    return 0;
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
    const childElementsLine1 = this.line1.nativeElement.querySelectorAll('.app-video');

    childElementsLine1.forEach((childElement: HTMLElement) => {
      if (width < 600) {
        this.renderer.addClass(childElement, 'video-size');
      } else {
        this.renderer.removeClass(childElement, 'video-size');
      }
    });
  }

  isFullscreenChanged(): boolean {
    return !!document.fullscreenElement;
  }

  private toggleMode(containerRef: ElementRef, savedScrollLeft: number, savedRelativePositions: number[]): void {
    const outerContainer = containerRef.nativeElement as HTMLElement;
    if (outerContainer) {
      if (!this.isScrollable) {
        this.savedScrollLeft = outerContainer.scrollLeft;
        outerContainer.style.overflowX = 'visible';
        let previousPosition = 0;

        Array.from(outerContainer.children).forEach((item: HTMLElement, index: number) => {
          const originalRelativePosition = savedRelativePositions[index];
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
  }

  // Usage
  scrollingLeft1() {
    this.isScrollable = true;
    this.toggleMode(this.line1, this.savedScrollLeft, this.savedRelativePositions);
    const outerContainer = this.line1.nativeElement as HTMLElement;
    if (outerContainer) {
      outerContainer.scrollLeft -= 700;
    }
  }

  scrollingRight1() {
    this.isScrollable = true;
    this.toggleMode(this.line1, this.savedScrollLeft, this.savedRelativePositions);
    const outerContainer = this.line1.nativeElement as HTMLElement;
    if (outerContainer) {
      outerContainer.scrollLeft += 700;
    }
  }

  toVisibleModus1() {
    this.savePositions(this.line1, this.savedScrollLeft, this.savedRelativePositions, 'leftmostId', 'rightmostId');
    this.isScrollable = false;
    this.toggleMode(this.line1, this.savedScrollLeft, this.savedRelativePositions);
  }

  private isContainerScrollable(container: HTMLElement): boolean {
    return container.scrollWidth > container.clientWidth;
  }

  onHover(id: string) {
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

    if (this.onHoverVideo) {
      if (id === this.leftmostId) { this.changeChildStylesLeft(id); }
      if (id === this.rightmostId) { this.changeChildStylesRight(id); }
    }
  }

  shouldHandleEvent(id: string): boolean {
    return !this.disableEvents || this.activeVideoId === id;
  }

  onLeave(id: string) {
    this.layover();
    if (this.activeVideoId === id) {
      this.activeVideoId = null;
    }

    this.disableEvents = true;
    setTimeout(() => {
      this.disableEvents = false;
    }, 100);

    if (id === this.leftmostId) { this.changeBackChildStylesLeft(id) }
    if (id === this.rightmostId) { this.changeBackChildStylesRight(id) }

    this.onHoverVideo = false;
    setTimeout(() => {
      this.onHoverVideo = true;
    }, 100);
  }

  layover() {
    let layover = document.getElementById('mainpageOverlay');
    layover.style.display = "block";
    setTimeout(() => {
      layover.style.display = "none";
    }, 500);
  }

  private changeChildStyles(id: string, transform: string, zIndex: string): void {
    const childElementsLine1 = this.line1.nativeElement.querySelectorAll('.app-video');

    this.renderer.addClass(childElementsLine1, 'transition-slow');
    this.renderer.setStyle(childElementsLine1, 'transform', transform);
    this.renderer.setStyle(childElementsLine1, 'z-index', zIndex);
  }

  changeChildStylesLeft(id: string) {
    this.changeChildStyles(id, `translateX(${this.positionLeftMostVideo(id)}px)`, '1000');
  }

  changeChildStylesRight(id: string) {
    this.changeChildStyles(id, `translateX(${this.positionRightMostVideo(id)}px)`, '1000');
  }

  changeBackChildStylesLeft(id: string) {
    this.changeChildStyles(id, 'translateX(0)', '100');
  }

  changeBackChildStylesRight(id: string) {
    this.changeChildStyles(id, 'translateX(0)', '100');
  }


  private bindUserInteraction(): void {
    if (!this.userInteractionBound) {
      document.addEventListener('click', this.enableAudioOnInteraction.bind(this), { once: true });
      document.addEventListener('keydown', this.enableAudioOnInteraction.bind(this), { once: true });
      document.addEventListener('touchstart', this.enableAudioOnInteraction.bind(this), { once: true });
      this.userInteractionBound = true;
    }
  }

  private unbindUserInteraction(): void {
    document.removeEventListener('click', this.enableAudioOnInteraction.bind(this));
    document.removeEventListener('keydown', this.enableAudioOnInteraction.bind(this));
    document.removeEventListener('touchstart', this.enableAudioOnInteraction.bind(this));
  }

  private enableAudioOnInteraction(): void {
    if (this.videoPlayerMain) {
      this.videoService.enableAudio(this.videoPlayerMain);
    }
    this.unbindUserInteraction();
  }

  ngOnDestroy(): void {
    this.unbindUserInteraction();
  }
}



// title: string;
// description: string;
// category: string;
// line1Videos: VideoData[] = [];    // für später, wenn wir über 10 Videos haben
// line2Videos: VideoData[] = [];    // für später, wenn wir über 10 Videos haben
// hls: Hls | null = null;
// currentVideo: string;
// posterUrlGcs: string = '';
// pageChangedSetTime: any;
// startRandomVideoSetTime: any;
// videoCurrentTime = 0;

// ngOnInit(): void {
//   this.bindUserInteraction();
//   this.getRandomVideo();
//   this.getVideoData();

//   // this.videoService.logWindowSize();
//   // setTimeout(() => {
//   //   this.adjustChildClass(window.innerWidth); // ab 600px
//   // }, 2000);
// }

// private scrollElementById(id: string, scrollAmount: number): void {
//   setTimeout(() => {
//     const element: HTMLElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//     if (element) {
//       element.scrollLeft += scrollAmount;
//     }
//   }, 0);
// }

// createMyFilms(fileName: string): Observable<any> {
//   const apiUrl = 'http://localhost:8000/my-films/';
//   const body = { file_name: fileName };
//   const headers = new HttpHeaders({
//     'Content-Type': 'application/json',
//   });
//   return this.http.post(apiUrl, body, { headers });
// }

// onFullscreenChange(): void {
//   if (this.isFullscreenChanged()) {
//     this.createMyFilms(this.videoService.currentVideo).subscribe({
//       next: (response) => {
//         console.log('Antwort vom Backend:', response);
//       },
//       error: (error) => {
//         console.error('Fehler bei der Anfrage:', error);
//       }
//     });
//     // console.log('Das Dokument ist im Fullscreen-Modus.');
//   } else {
//     //console.log('Das Dokument ist nicht im Fullscreen-Modus.');
//   }
// }

// savePositions() {
//   if (window.innerWidth > 600) {
//     const outerContainer = this.line1.nativeElement;
//     this.savedScrollLeft = outerContainer.scrollLeft;
//     const children = Array.from(outerContainer.children) as HTMLElement[];
//     let leftmostPosition = Number.POSITIVE_INFINITY;
//     let rightmostPosition = Number.NEGATIVE_INFINITY;
//     let leftmostElement: HTMLElement | null = null;
//     let rightmostElement: HTMLElement | null = null;

//     const containerRect = outerContainer.getBoundingClientRect();
//     const containerLeft = containerRect.left;
//     const containerRight = containerRect.right;

//     this.savedRelativePositions = children.map((item) => {
//       const itemRect = item.getBoundingClientRect();
//       const position = itemRect.left - containerLeft + outerContainer.scrollLeft;
//       const isVisible = itemRect.left < containerRight && itemRect.right > containerLeft;
//       if (isVisible) {
//         if (position < leftmostPosition) {
//           leftmostPosition = position;
//           leftmostElement = item;
//           this.leftmostId = item.id;
//           this.positionLeftMostVideo(this.leftmostId);

//         }
//         if (position > rightmostPosition) {
//           rightmostPosition = position;
//           rightmostElement = item;
//           this.rightmostId = item.id;
//           this.positionRightMostVideo(this.rightmostId);
//         }
//       }

//       return position;
//     });

//     if (leftmostElement) {
//       const posterImg = leftmostElement.querySelector('#posterImg') as HTMLImageElement;
//       const leftmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
//     } else {
//     }

//     if (rightmostElement) {
//       const posterImg = rightmostElement.querySelector('#posterImg') as HTMLImageElement;
//       const rightmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
//     } else {
//     }
//   }
// }

// savePositions2() {
//   if (window.innerWidth > 600) {
//     const outerContainer = this.line2.nativeElement;
//     this.savedScrollLeft2 = outerContainer.scrollLeft;
//     const children = Array.from(outerContainer.children) as HTMLElement[];
//     let leftmostPosition = Number.POSITIVE_INFINITY;
//     let rightmostPosition = Number.NEGATIVE_INFINITY;
//     let leftmostElement: HTMLElement | null = null;
//     let rightmostElement: HTMLElement | null = null;

//     const containerRect = outerContainer.getBoundingClientRect();
//     const containerLeft = containerRect.left;
//     const containerRight = containerRect.right;

//     this.savedRelativePositions2 = children.map((item) => {
//       const itemRect = item.getBoundingClientRect();
//       const position = itemRect.left - containerLeft + outerContainer.scrollLeft;
//       const isVisible = itemRect.left < containerRight && itemRect.right > containerLeft;
//       if (isVisible) {
//         if (position < leftmostPosition) {
//           leftmostPosition = position;
//           leftmostElement = item;
//           this.leftmostId2 = item.id;
//           this.positionLeftMostVideo(this.leftmostId2);

//         }
//         if (position > rightmostPosition) {
//           rightmostPosition = position;
//           rightmostElement = item;
//           this.rightmostId2 = item.id;
//           this.positionRightMostVideo(this.rightmostId2);
//         }
//       }

//       return position;
//     });

//     if (leftmostElement) {
//       const posterImg = leftmostElement.querySelector('#posterImg') as HTMLImageElement;
//       const leftmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
//     } else {
//     }

//     if (rightmostElement) {
//       const posterImg = rightmostElement.querySelector('#posterImg') as HTMLImageElement;
//       const rightmostPosterUrl = posterImg ? posterImg.src : 'No Poster URL';
//     } else {
//     }
//   }
// }

// positionLeftMostVideo(id: string): number {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   if (childElement) {
//     const elementRect = childElement.getBoundingClientRect();
//     const elementXPosition = elementRect.x;
//     return (elementXPosition * -1) + 30;
//   }
//   return 0;
// }

// positionRightMostVideo(id: string): number {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   const elementRect = childElement.getBoundingClientRect();
//   if (childElement &&
//     elementRect.right > window.innerWidth || (window.innerWidth - elementRect.right) < 30) {
//     const elementXPosition = elementRect.x;
//     const elementWidth = elementRect.width;
//     const displayWidth = window.innerWidth;
//     const rightmostXPosition = elementWidth - (displayWidth - elementXPosition);
//     return (rightmostXPosition * -1) - 80;
//   }
//   return 0;
// }

// toggleMode() {
//   const outerContainer = this.line1.nativeElement;
//   if (!this.isScrollable) {
//     this.savedScrollLeft = outerContainer.scrollLeft;
//     outerContainer.style.overflowX = 'visible';
//     const screenWidth = outerContainer.offsetWidth;
//     let previousPosition = 0;
//     Array.from(outerContainer.children).forEach((item: HTMLElement, index: number) => {
//       const originalRelativePosition = this.savedRelativePositions[index];
//       let newLeft = originalRelativePosition - this.savedScrollLeft;

//       if (index > 0 && !this.isContainerScrollable(outerContainer)) {
//         newLeft = Math.min(newLeft, previousPosition);
//       }

//       item.style.position = 'relative';
//       item.style.left = `${newLeft}px`;

//       previousPosition = newLeft;
//     });

//   } else {
//     outerContainer.style.overflowX = 'scroll';
//     outerContainer.scrollLeft = this.savedScrollLeft;
//     Array.from(outerContainer.children).forEach((item: HTMLElement) => {
//       item.style.position = 'static';
//       item.style.left = '0px';
//     });

//   }
//   this.isScrollable = !this.isScrollable;
// }

// scrollingLeft1() {
//   this.isScrollable = true;
//   this.toggleMode();
//   const outerContainer = this.line1.nativeElement;
//   outerContainer.scrollLeft -= 700;
// }

// scrollingRight1() {
//   this.isScrollable = true;
//   this.toggleMode();
//   const outerContainer = this.line1.nativeElement;
//   outerContainer.scrollLeft += 700;
// }

// toVisibleModus1() {
//   this.savePositions();
//   this.isScrollable = false;
//   this.toggleMode();
// }

// toggleMode2() {
//   const outerContainer = this.line2.nativeElement;
//   if (!this.isScrollable) {
//     this.savedScrollLeft = outerContainer.scrollLeft;
//     outerContainer.style.overflowX = 'visible';
//     const screenWidth = outerContainer.offsetWidth;
//     let previousPosition = 0;
//     Array.from(outerContainer.children).forEach((item: HTMLElement, index: number) => {
//       const originalRelativePosition = this.savedRelativePositions2[index];
//       let newLeft = originalRelativePosition - this.savedScrollLeft2;

//       if (index > 0 && !this.isContainerScrollable(outerContainer)) {
//         newLeft = Math.min(newLeft, previousPosition);
//       }

//       item.style.position = 'relative';
//       item.style.left = `${newLeft}px`;

//       previousPosition = newLeft;
//     });
//   } else {
//     outerContainer.style.overflowX = 'scroll';
//     outerContainer.scrollLeft = this.savedScrollLeft2;
//     Array.from(outerContainer.children).forEach((item: HTMLElement) => {
//       item.style.position = 'static';
//       item.style.left = '0px';
//     });
//   }
//   this.isScrollable = !this.isScrollable;
// }

// scrollingLeft2() {
//   this.isScrollable = true;
//   this.toggleMode2();
//   const outerContainer = this.line2.nativeElement;
//   outerContainer.scrollLeft -= 700;
// }

// scrollingRight2() {
//   this.isScrollable = true;
//   this.toggleMode2();
//   const outerContainer = this.line2.nativeElement;
//   outerContainer.scrollLeft += 700;
// }

// toVisibleModus2() {
//   this.savePositions2();
//   this.isScrollable = false;
//   this.toggleMode2();
// }


// changeChildStylesLeft(id: string) {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   if (childElement) {
//     this.renderer.addClass(childElement, 'transition-slow');
//     this.renderer.setStyle(childElement, 'transform', `translateX(${this.positionLeftMostVideo(id)}px)`);
//     this.renderer.setStyle(childElement, 'z-index', '1000');
//   }
// }

// changeChildStylesRight(id: string) {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   if (childElement) {
//     this.renderer.addClass(childElement, 'transition-slow');
//     this.renderer.setStyle(childElement, 'transform', `translateX(${this.positionRightMostVideo(id)}px)`);
//     this.renderer.setStyle(childElement, 'z-index', '1000');
//   }
// }

// changeBackChildStylesLeft(id: string) {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   if (childElement) {
//     this.renderer.addClass(childElement, 'transition-slow');
//     this.renderer.setStyle(childElement, 'transform', 'translateX(0)');
//     this.renderer.setStyle(childElement, 'z-index', '100');
//   }
// }

// changeBackChildStylesRight(id: string) {
//   const childElement = this.elementRef.nativeElement.querySelector(`#${id}`);
//   if (childElement) {
//     this.renderer.addClass(childElement, 'transition-slow');
//     this.renderer.setStyle(childElement, 'transform', 'translateX(0)');
//     this.renderer.setStyle(childElement, 'z-index', '100');
//   }
// }