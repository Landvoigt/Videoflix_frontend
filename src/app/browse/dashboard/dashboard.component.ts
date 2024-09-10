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
  loading: boolean = false;

  randomVideo$: Observable<VideoData | undefined>;
  videos$: Observable<VideoData[]>;

  private userInteractionBound: boolean = false;
  videoUrl: string = '';
  videoKeyRandomVideo: string;
  muted: boolean;
  @ViewChild('videoPlayerMain', { static: true }) videoPlayerMain!: ElementRef<HTMLVideoElement>;
  // @ViewChildren('targetElement') targetElements!: QueryList<ElementRef>;
  @ViewChild('line1', { static: false }) line1: ElementRef;
  @ViewChild('line2', { static: false }) line2: ElementRef;
  savedScrollLeft: number = 0;
  savedRelativePositions: number[] = [];
  isScrollable: boolean = false;
  isFullscreen: boolean = false;
  showLeftArrow: boolean = false;
  showLeftArrow2: boolean = false;
  showRightArrow: boolean = true;
  showRightArrow2: boolean = true;
  leftmostId: string = '';
  rightmostId: string = '';
  onHoverVideo: boolean = true;
  activeVideoId: string | null = null;
  disableEvents: boolean = false;
  currentVideo!: VideoData;
  posters: string[] = [];

  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    public videoService: VideoService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.getRandomVideo();
    this.getVideoData();
    this.muted = true;
  }

  ngAfterViewInit(): void {
    this.posters = this.videoService.posterUrls.concat(this.videoService.posterUrls);
  }

  checkScroll() {
    const scrollcontainer = this.line1.nativeElement;
    const scrollcontainer2 = this.line2.nativeElement;
    this.showLeftArrow = scrollcontainer.scrollLeft > 0;
    this.showRightArrow = scrollcontainer.scrollWidth > scrollcontainer.scrollLeft + scrollcontainer.clientWidth;
    this.showLeftArrow2 = scrollcontainer2.scrollLeft > 0;
    this.showRightArrow2 = scrollcontainer2.scrollWidth > scrollcontainer2.scrollLeft + scrollcontainer2.clientWidth;
  }

  scrollingLeft(line: any) {
    line.nativeElement.scrollLeft -= 650;
  }

  scrollingRight(line: any) {
    line.nativeElement.scrollLeft += 6500;
  }

  onElementHover(event: MouseEvent): void {
    const targetElement = event.currentTarget as HTMLElement;
    const elementId = targetElement.id;

    if (!elementId || !this.line1 || !this.line2) {
      console.log('Element has no ID or #line1/#line2 is undefined');
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const lines = [this.line1.nativeElement, this.line2.nativeElement];

    lines.forEach((line) => {
      const containerRect = line.getBoundingClientRect();
      const containerStartX = containerRect.left;
      const containerEndX = containerRect.right;

      let translateX = 0;
      if (rect.x <= containerStartX + 5) {
        translateX = (containerStartX - rect.x) + 50;
      } else if ((rect.x + rect.width) >= containerEndX - 50) {
        translateX = -((rect.x + rect.width) - containerEndX + 50);
      }

      if (translateX !== 0) {
        const childElements = line.querySelectorAll('.app-video');

        childElements.forEach((childElement: HTMLElement) => {
          if (childElement.id === elementId) {
            this.renderer.addClass(childElement, 'transition-slow');
            this.renderer.setStyle(childElement, 'transform', `translateX(${translateX}px)`);
            this.renderer.setStyle(childElement, 'z-index', '1000');
          }
        });
      }
    });
  }

  onElementLeave(event: MouseEvent): void {
    const targetElement = event.currentTarget as HTMLElement;
    const elementId = targetElement.id;

    if (!elementId) return;

    const lines = [this.line1?.nativeElement, this.line2?.nativeElement];

    lines.forEach((line) => {
      if (!line) return;

      const childElements = line.querySelectorAll('.app-video');

      childElements.forEach((childElement: HTMLElement) => {
        if (childElement.id === elementId) {
          this.renderer.removeClass(childElement, 'transition-slow');
          this.renderer.removeStyle(childElement, 'transform');
          this.renderer.removeStyle(childElement, 'z-index');
        }
      });
    });
  }

  getRandomVideo(): void {
    this.randomVideo$ = this.videoService.getRandomVideoData();
    this.randomVideo$.subscribe({
      next: (video: VideoData | undefined) => {
        if (video) {
          this.getVideoUrl(video.subfolder, this.videoService.getVideoElementResolution(this.videoPlayerMain.nativeElement));
          this.currentVideo = video;
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
        this.videoKeyRandomVideo = videoKey;
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
    this.videoService.maxDuration = 15;
    this.videoService.playRandomVideo(this.videoPlayerMain, this.videoUrl);
    this.videoPlayerMain.nativeElement.muted = true;
  }

  requestFullScreen(video: HTMLVideoElement): void {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  handleFullscreenChange(event: Event) {
    this.onFullscreenChange(event);
  }

  onFullscreenChange(event: Event) {
    this.isFullscreen = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);
    if (this.isFullscreen) {
      this.videoPlayerMain.nativeElement.muted = false;
      console.log('Ton an');
    } else {
      console.log('Ton aus');
      this.videoPlayerMain.nativeElement.muted = true;
      this.muted = true;
      this.videoPlayerMain.nativeElement.currentTime = 0;
      this.videoService.maxDuration = 15;
    }
  }

  playVideoButton() {
    this.videoService.currentVideo = this.videoKeyRandomVideo;
    this.videoService.playRandomVideo(this.videoPlayerMain, this.videoUrl);
    this.videoPlayerMain.nativeElement.muted = false;
    this.videoService.maxDuration = 100000;
    this.requestFullScreen(this.videoPlayerMain.nativeElement);
  }

  toggleMute() {
    this.videoPlayerMain.nativeElement.muted = !this.videoPlayerMain.nativeElement.muted;
    this.muted = this.videoPlayerMain.nativeElement.muted;
    //console.log(`muted ${this.muted ? 'True' : 'False'}`);
  }

  ngOnDestroy(): void {
    clearInterval(this.videoService.intervalId);
  }
}