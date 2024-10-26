import { Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { NavigationService } from '@services/navigation.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [CommonModule, LogoComponent],
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.scss'
})
export class FrontpageComponent {
  loading: boolean = true;
  loggedIn: boolean = false;

  constructor(private authService: AuthService, public navService: NavigationService) {
    this.checkLoginStatus();
  }


  ngOnInit(): void {
    this.trackClicks();
  }

  checkLoginStatus(): void {
    this.authService.isLoggedIn().pipe(take(1)).subscribe((isLoggedIn: boolean) => {
      this.loggedIn = isLoggedIn;
      this.loading = false;
    });
  }

  logout() {
    this.loggedIn = false;
    this.authService.logout();
  }




  // Funktion zur Überwachung der Klicks auf der Welcome-Seite
  trackClicks() {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (this.isClickable(target)) {
        console.log(`Clicked element is clickable: <${target.tagName.toLowerCase()}> with class: ${target.className}`);
      } else {
        console.log(`Clicked element is not clickable: <${target.tagName.toLowerCase()}> with class: ${target.className}`);
      }
    });
  }

  // Überprüft, ob das geklickte Element klickbar ist (z. B. Buttons, Links, etc.)
  isClickable(element: HTMLElement): boolean {
    const clickableTags = ['button', 'a', 'input']; // Liste der interaktiven Elemente
    const clickableRoles = ['button', 'link'];

    // Prüfen, ob das Element ein Button oder Link ist (anhand des Tags oder des Role-Attributs)
    if (clickableTags.includes(element.tagName.toLowerCase()) ||
        clickableRoles.includes(element.getAttribute('role') || '')) {
      return true;
    }

    // Optional: Prüfen, ob das Element eine spezifische klickbare Klasse hat (falls gewünscht)
    // Beispiel: Elemente mit einer bestimmten CSS-Klasse, z.B. 'btn' oder 'clickable'
    if (element.classList.contains('btn') || element.classList.contains('clickable')) {
      return true;
    }

    return false;
  }

}