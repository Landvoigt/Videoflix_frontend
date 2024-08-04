import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { VideoComponent } from '../../video/video.component';

export interface VideoData {
  subfolder: string;
  description: string;
  title: string;
  posterUrlGcs?: string; 
  category: string;
}

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './series.component.html',
  styleUrl: './series.component.scss'
})
export class SeriesComponent {
  //allSeries: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  videoDataGcs: VideoData[] = []; 
  series: VideoData[] = [];
  title: string;
  description: string;
  posterUrlGcs: string = ''; 

  constructor(
   private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.videoService.fetchAndStoreVideoData();
    this.videoService.getStoredVideoData().subscribe(data => {
      this.videoDataGcs = data;
      console.log('Processed video data in FilmsComponent:', this.videoDataGcs);
     });
     this.series = this.videoDataGcs.filter(video => video.category === 'serie');
     console.log('Series:', this.series);
  }


}
