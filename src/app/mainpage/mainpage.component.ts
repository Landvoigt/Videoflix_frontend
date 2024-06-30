import { ApplicationRef, Component, ElementRef, NgZone, OnInit, ViewChild, inject} from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { AuthService } from '../auth/auth.service';
import Hls from 'hls.js'; 
import { first } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss'
})
export class MainpageComponent implements OnInit {


  videoUrl: string = '';
  @ViewChild('videoPlayerStart', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;


  constructor(
    public navService: NavigationService,
    public authService: AuthService,
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef
  ) {

  }


  // ngAfterViewInit() {
  //  // this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
  //     const resolution = this.getResolution();
  //     console.log('Resolution: ', this.getResolution());
  //     this.getVideoUrl('jellyfish', resolution);
  //  // });
  // }

  // getResolution(): string {
  //   const width = window.innerWidth;
  //   if (width >= 1920) {
  //     return '1080p';
  //   } else if (width >= 1280) {
  //     return '720p';
  //   } else if (width >= 854) {
  //     return '480p';
  //   } else {
  //     return '360p';
  //   }
  // }

  // getVideoUrl(videoKey: string, resolution: string) {
  //   const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

  //   this.http.get<any>(apiUrl).subscribe({
  //     next: (data) => {
  //       console.log('Response from server:', data);
  //       if (data && data.video_url) {
  //         this.videoUrl = data.video_url;
  //         console.log('Updated videoUrl:', this.videoUrl);
  //         this.setupVideoPlayer();
  //       } else {
  //         console.error('Invalid response format from server');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching video URL:', error);
  //     }
  //   });
  // }

  // setupVideoPlayer() {
  //   this.ngZone.runOutsideAngular(() => {
  //     if (Hls.isSupported()) {
  //       const hls = new Hls();
  //       hls.loadSource(this.videoUrl);
  //       hls.attachMedia(this.videoPlayer.nativeElement);
  //       hls.on(Hls.Events.MANIFEST_PARSED, () => {
  //         console.log('HLS manifest parsed');
  //       });
  //     } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
  //       this.videoPlayer.nativeElement.src = this.videoUrl;
  //       this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
  //         console.log('Native HLS support, video loaded');
  //       });
  //     } else {
  //       console.error('HLS is not supported in this browser');
  //     }
  //   });



  // ngAfterView() {
  //   const resolution = this.getResolution();
  //   console.log('Resolution: ', this.getResolution());
  //   this.getVideoUrl('jellyfish', resolution);
  // }

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

  getVideoUrl(videoKey: string, resolution: string) {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        console.log('Response from server:', data);
        if (data && data.video_url) {
          this.videoUrl = data.video_url;
          console.log('Updated videoUrl:', this.videoUrl);
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
          console.log('HLS manifest parsed');
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



  
















  elementRef = inject(ElementRef)


  ngOnInit(): void {
    const resolution = this.getResolution();
    console.log('Resolution: ', this.getResolution());
    this.getVideoUrl('jellyfish', '360p');
    const lineIds = ['line1', 'line2', 'line3'];
    lineIds.forEach(id => this.scrollElementById(id, 500));
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


 