import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { VideoService } from '@services/video.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.scss'
})
export class LoadingScreenComponent implements AfterViewInit {
  @ViewChild('loadingOverlay', { static: true }) loadingOverlay!: ElementRef;

  constructor(private videoService: VideoService) { }

  ngAfterViewInit() {
    this.videoService.loadingApp$.subscribe(isLoading => {
      if (isLoading) {
        this.showLoadingAnimation();
      } else {
        this.hideLoadingAnimation();
      }
    });

    this.videoService.fetchVideoData();
  }

  showLoadingAnimation() {
    this.loadingOverlay.nativeElement.classList.add('active');
  }

  hideLoadingAnimation() {
    this.loadingOverlay.nativeElement.classList.remove('active');
  }
}