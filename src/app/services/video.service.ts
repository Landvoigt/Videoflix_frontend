import { ElementRef, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  hls_playlist: string;
  video_file:string;
}
interface VideosResponse {
  videos: Video[];
}


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  videoUrls: string[] = [];
  videoUrl: string = '';
  posterUrls: string[] = [];
  videoData: { videoUrlGcs: string; posterUrlGcs: string;title: string; description: string }[] = [];
  videoPlayer:ElementRef;
  randomVideo: string;
  descriptionUrl:string = "";
  titleUrl:string = "";
 
 
  constructor(private http: HttpClient, private ngZone: NgZone) {}

 

  loadAllVideoUrls(videoPlayer: ElementRef): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;
   
    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
        this.videoUrls = response.video_urls;
        this.setupVideoPlayer(videoPlayer, this.videoUrls.length > 0 ? this.videoUrls[0] : '/assets/img/barni/300.png');
        this.getRandomVideoUrl();
        if (this.videoUrls && this.videoUrls.length > 0) {
         
          this.checkVideoDataAvailability().subscribe(isAvailable => {
            if (isAvailable) {
              this.createVideoData();             
            } else {
              console.warn('Required video data not available in Django');
            }
          });
        } else {
          console.warn('No video URLs found in the response');
        }
      },
      error: (error) => {
        console.error('Error fetching video URLs:', error);
      }
    });
  }

  
  checkVideoDataAvailability(): Observable<boolean> {
    const apiUrl = `http://localhost:8000/check-video-data/`;
    return this.http.post<{ is_available: boolean }>(apiUrl, { video_urls: this.videoUrls }).pipe(
      map(response => response.is_available),
    );
  }


  getRandomVideoUrl(): string {
    const randomIndex = Math.floor(Math.random() * this.videoUrls.length);
    const randomDataName = this.getDirectoryNameFromUrl(this.videoUrls[randomIndex]);
    this.getVideoUrl(randomDataName,'360p');
    this.textForMainVideo((randomDataName));
    return this.videoUrls[randomIndex];
  }


  textForMainVideo(randomDataName: string): void {
    console.log('randomDataName',randomDataName);
      this.descriptionUrl = `https://storage.googleapis.com/videoflix-videos/text/${randomDataName}/description.txt`;
      this.titleUrl = `https://storage.googleapis.com/videoflix-videos/text/${randomDataName}/title.txt`;
  }

 
  getDescription(): Observable<string> {
    return this.http.get(this.descriptionUrl, { responseType: 'text' });
  }

  getTitle(): Observable<string> {
    return this.http.get(this.titleUrl, { responseType: 'text' });
  }


  getDirectoryNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2];
  }


  getPosterFileName(videoUrlGcs: string): string {
    if (!videoUrlGcs) {
      return 'default-poster.jpg'; 
    }
    const urlParts = videoUrlGcs.split('/');
    const lastPart = urlParts[urlParts.length - 2]; 
    const fileName = lastPart + '.jpg'; 
    return fileName;
  }
  

  createVideoData(): void {
    this.getAllVideos().subscribe({
      next: (data) => {
        this.videoData = data.videos.map((video) => ({
          videoUrlGcs: video.hls_playlist,
          posterUrlGcs: (video.hls_playlist ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}` : '/assets/img/default-poster.png'),
          title: video.title,
          description: video.description,
        }));
        //console.log('this.videoData:', this.videoData);
      },
      error: (error) => {
        console.error('Error fetching video data:', error);
      }
    });
  }


  getAllVideos(): Observable<VideosResponse> {
    const apiUrlVideos = 'http://localhost:8000/api/videos/';
    return this.http.get<VideosResponse>(apiUrlVideos);
  }
  
  

  getVideoUrl( videoKey: string, resolution: string): void {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;
    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          this.videoUrl = data.video_url;  // Hauptvideo
          this.videoUrls.push(data.video_url);
          this.setupVideoPlayer(this.videoPlayer, this.videoUrl);
          //console.log('this.videoUrl',this.videoUrl);  
        } else {
          console.error('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
      }
    });
  }



  loadPosterUrls(): void {
    const apiUrl = 'http://localhost:8000/get_poster_urls/';

    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        this.posterUrls = response.poster_urls;
      },
      error: (error) => {
        console.error('Error fetching poster URLs:', error);
      }
    });
    
  }


setupVideoPlayer(videoPlayer: ElementRef, videoUrl:any): void {
    videoPlayer = this.videoPlayer;
    if (!videoPlayer) {
      console.error('Video player element is undefined');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoPlayer.nativeElement.play();
        });
      } else if (videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.nativeElement.src = videoUrl;
        videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
          videoPlayer.nativeElement.play();
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
   
  }

}
