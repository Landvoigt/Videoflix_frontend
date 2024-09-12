import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeIn } from '@utils/animations';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-success.component.html',
  styleUrl: './register-success.component.scss',
  animations: [fadeIn]
})
export class RegisterSuccessComponent {

  constructor(public navService: NavigationService) { }

}