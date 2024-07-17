import { AfterViewInit, ApplicationRef, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { first } from 'rxjs';
import { VideoService } from '../services/video.service';
import { Video } from '../../models/video.model';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})


export class VideoComponent implements AfterViewInit {

 
isVideoPlaing = true;
videoUrl: string = '';
videos: Video[] = [];
@Input() title: string;
@Input() description: string;
@Input() videoUrlGcs: string;
@Input() posterUrlGcs: string;
@Output() hover = new EventEmitter<boolean>();
@ViewChild('videoPlayer', { static: true }) videoPlayer: ElementRef<HTMLVideoElement>


  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private videoService: VideoService
  ) {}


   ngOnInit(): void {
   
    
   }


ngAfterViewInit() {
    this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
      const resolution = '360p';
       this.getVideoUrl('waterfall_1', resolution);
    });
}
  
onHover() {
  this.videoPlayer.nativeElement.play(); 
  this.isVideoPlaing = true;
  this.hover.emit(true);
}

onLeave() {
  this.videoPlayer.nativeElement.pause();
  this.videoPlayer.nativeElement.currentTime = 0; 
  this.isVideoPlaing = false;
  this.hover.emit(false);
}


  getVideoUrl(videoKey: string, resolution: string) {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          this.videoUrl = data.video_url;
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
    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(this.videoUrlGcs);
        hls.attachMedia(this.videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
        });
      } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        this.videoPlayer.nativeElement.src = this.videoUrlGcs;
        this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
  }

 }
