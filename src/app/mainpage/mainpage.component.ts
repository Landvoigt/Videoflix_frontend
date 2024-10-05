import { Component, OnInit } from '@angular/core';
import { fadeInSuperSlow } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../mainpage/dashboard/dashboard.component';
import { FilmsComponent } from '../mainpage/films/films.component';
import { SeriesComponent } from '../mainpage/series/series.component';
import { PlaylistComponent } from '../mainpage/playlist/playlist.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { VideoService } from '@services/video.service';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, LoadingScreenComponent, NavbarComponent, FooterComponent, DashboardComponent, FilmsComponent, SeriesComponent, PlaylistComponent],
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  animations: [fadeInSuperSlow],
})
export class MainpageComponent implements OnInit {
  currentPage: 'dashboard' | 'films' | 'series' | 'playlist' = 'dashboard';
  closeMenu: boolean = false;

  constructor(public videoService: VideoService) { }

  ngOnInit() {
    this.loadCurrentPage();
    this.videoService.fetchVideoData();
  }

  loadCurrentPage() {
    const storedPage = localStorage.getItem('currentPage') as 'dashboard' | 'films' | 'series' | 'playlist';
    if (storedPage) {
      this.currentPage = storedPage;
    }
  }

  onPageChanged(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    this.videoService.setVideoLoading(true);
    this.currentPage = page;
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    return this.currentPage === page;
  }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }
}