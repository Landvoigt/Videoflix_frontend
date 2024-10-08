import { Component } from '@angular/core';
import { fadeIn } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { NavigationService } from '@services/navigation.service';
import { ProfileService } from '@auth/profile.service';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
  animations: [fadeIn]

})
export class ErrorPageComponent {

  constructor(private profileService: ProfileService, private navService: NavigationService) { }

  relocate() {
    if (this.profileService.profileSelected) {
      this.navService.main();
    } else {
      this.navService.welcome();
    }
  }
}