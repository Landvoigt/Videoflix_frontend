import { Component, OnInit, ViewChild } from '@angular/core';
import { fadeInPage } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../browse/dashboard/dashboard.component';
import { FilmsComponent } from '../browse/films/films.component';
import { SeriesComponent } from '../browse/series/series.component';
import { PlaylistComponent } from '../browse/playlist/playlist.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, LoadingScreenComponent, NavbarComponent, FooterComponent, DashboardComponent, FilmsComponent, SeriesComponent, PlaylistComponent],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.scss',
  animations: [fadeInPage],
})
export class MainpageComponent implements OnInit {
  @ViewChild(DashboardComponent) dashboardComponent: DashboardComponent;
  @ViewChild(FilmsComponent) filmsComponent: FilmsComponent;
  @ViewChild(SeriesComponent) seriesComponent: SeriesComponent;
  @ViewChild(PlaylistComponent) playlistComponent: PlaylistComponent;

  currentPage: 'dashboard' | 'films' | 'series' | 'playlist' = 'dashboard';
  loadingApp: boolean = true;
  closeMenu: boolean = false;

  ngOnInit(): void {
    // this.loadingApp = true;  
  }

  onPageChanged(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    this.currentPage = page;
    switch (page) {
      case 'dashboard':
        // this.dashboardComponent?.initialize();
        break;
      case 'films':
        // this.filmsComponent?.someMethod();
        // clearTimeout(this.pageChangedSetTime);
        // clearTimeout(this.startRandomVideoSetTime);
        break;
      case 'series':
        // this.seriesComponent?.someMethod();
        // clearTimeout(this.pageChangedSetTime);
        // clearTimeout(this.startRandomVideoSetTime);
        break;
      case 'playlist':
        // this.playlistComponent?.someMethod();
        // clearTimeout(this.pageChangedSetTime);
        // clearTimeout(this.startRandomVideoSetTime);
        break;
    }
  }

  activePage(page: 'dashboard' | 'films' | 'series' | 'playlist') {
    return this.currentPage === page;
  }

  closeUserMenu() {
    this.closeMenu = true;
    setTimeout(() => this.closeMenu = false, 10);
  }
  

}