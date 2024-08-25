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

  showLoadingAnimation() {
    this.loadingOverlay.nativeElement.classList.add('active');
  }

  hideLoadingAnimation() {
    this.loadingOverlay.nativeElement.classList.remove('active');
  }

  simulateAppLoading() {
    this.showLoadingAnimation();

    this.videoService.fetchVideoData();

    setTimeout(() => {
      this.hideLoadingAnimation();
    }, 2500);
  }

  ngAfterViewInit() {
    this.simulateAppLoading();
  }
}
