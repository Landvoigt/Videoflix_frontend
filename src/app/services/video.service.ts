import { ElementRef, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { forkJoin, Observable, ReplaySubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  gcsData: any[] = [];

  
 
 
  constructor(private http: HttpClient, private ngZone: NgZone) {}

 

  loadAllVideoUrls(videoPlayer: ElementRef): void {
    const apiUrl = `http://localhost:8000/get-all-video-urls/`;
   
    this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
      next: (response) => {
        this.videoUrls = response.video_urls;
        this.setupVideoPlayer(videoPlayer, this.videoUrls.length > 0 ? this.videoUrls[0] : '/assets/img/videostore/300.png');
        this.getRandomVideoUrl();
        if (this.videoUrls && this.videoUrls.length > 0) {
          this.createVideoData();  
          this.checkVideoDataAvailability().subscribe(isAvailable => {
            if (isAvailable) {
              //this.createVideoData();           
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
    //console.log('randomDataName',randomDataName);
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
  

  // createVideoData(): void {                // Grundversio
  //   this.getAllVideos().subscribe({
  //     next: (data) => {
  //       this.videoData = data.videos.map((video) => ({
  //         videoUrlGcs: video.hls_playlist,
  //         posterUrlGcs: (video.hls_playlist ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}` : '/assets/img/videostore/300.png'),
  //         title: video.title,
  //         description: video.description,
  //       }));
  //       //console.log('this.videoData:', this.videoData);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching video data:', error);
  //     }
  //   });
  // }


  // createVideoData(): void {                                // es ist mit django daten !!!!!!!
  //   this.getAllVideos().subscribe({
  //     next: (data) => {
  //       this.videoData = data.videos.map((video) => ({
  //         videoUrlGcs: video.hls_playlist,
  //         posterUrlGcs: (video.hls_playlist ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}` : '/assets/img/videostore/300.png'),
  //         title: video.title,
  //         description: video.description,
  //       }));
  
  //       // Now update title and description from gcsData if local data is missing
  //       this.videoData.forEach((video) => {
  //         if (!video.title || !video.description) {
  //           const subfolder = this.getSubfolderFromUrl(video.videoUrlGcs);
  //           const gcsInfo = this.gcsData.find((item) => item.subfolder === subfolder);
  //           console.log('gcsInfo.title',gcsInfo.title);
  //           if (gcsInfo) {
  //             video.title = video.title || gcsInfo.title || 'Default Title';
  //             video.description = video.description || gcsInfo.description || 'Default Description';
  //             console.log('gcsInfo.title',gcsInfo.title);
  //           }
  //         }
  //       });
  
  //       console.log('Updated videoData:', this.videoData);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching video data:', error);
  //     }
  //   });
  // }



  createVideoData(): void {
    this.getAllVideos().subscribe({
      next: (data) => {
        this.videoData = data.videos.map((video) => ({
          videoUrlGcs: video.hls_playlist,
          posterUrlGcs: video.hls_playlist
            ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}`
            : '/assets/img/videostore/300.png',
          title: '', 
          description: '', 
        }));
  
        this.videoData.forEach((video) => {
         setTimeout(() => {

          const subfolder = this.getSubfolderFromUrl(video.videoUrlGcs);
          const gcsInfo = this.gcsData.find((item) => item.subfolder === subfolder);
          if (gcsInfo) {
            video.title = gcsInfo.title || 'Default Title';
            video.description = gcsInfo.description || 'Default Description';
          }
          
         }, 2500);
        });
  
        //console.log('Updated videoData:', this.videoData);
      },
      error: (error) => {
        console.error('Error fetching video data:', error);
      }
    });
  }
  
  
  getSubfolderFromUrl(videoUrlGcs: string): string {
    const parts = videoUrlGcs.split('/');
    const subfolder = parts[parts.length - 2]; 
    return subfolder;
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

// Text laden von gcs  
private gcsDataUrl = 'http://localhost:8000/gcs-data/';

  fetchGcsData(): Observable<any[]> {
       return this.http.get<any[]>(this.gcsDataUrl);
  }

  getGcsData(): any[] {
    return this.gcsData;
  }

  loadGcsData(): void {
    this.fetchGcsData().subscribe({
      next: (data) => {
        this.gcsData = data.map(item => ({
          description_url: item.description_url,
          subfolder: item.subfolder,
          title_url: item.title_url,
          description: '',
          title: ''
        }));
        this.loadTextFileContents();
       // console.log('GCS Data loaded:', this.gcsData);
      },
      error: (error) => {
        console.error('Error fetching GCS data:', error);
      }
    });
  }

  private loadTextFileContents(): void {
    const requests: Observable<any>[] = this.gcsData.map(item => {
      const descriptionRequest = this.http.get(item.description_url, { responseType: 'text' });
      const titleRequest = this.http.get(item.title_url, { responseType: 'text' });

      return forkJoin({
        description: descriptionRequest,
        title: titleRequest
      }).pipe(
        map(response => {
          item.description = response.description;
          item.title = response.title;
          return item;
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (updatedData) => {
        this.gcsData = updatedData;
        //console.log('GCS Data with text content loaded:', this.gcsData);
      },
      error: (error) => {
        console.error('Error loading text file contents:', error);
      }
    });
  }

}
