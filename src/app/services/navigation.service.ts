import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router, private location: Location) { }

  // back() {
  //   this.location.back();
  // }

  // welcome() {
  //   this.router.navigate(['/welcome']);
  // }

  // login() {
  //   this.router.navigate(['/login']);
  // }

  // register() {
  //   this.router.navigate(['/register']);
  // }

  // registerSuccess() {
  //   this.router.navigate(['/register_success']);
  // }

  // sendMail() {
  //   this.router.navigate(['/send_mail']);
  // }

  // updateUsername() {
  //   this.router.navigate(['/update_username']);
  // }

  // profiles() {
  //   this.router.navigate(['/selection']);
  // }

  // main() {
  //   this.router.navigate(['/mainpage']);
  // }

  // imprint() {
  //   this.router.navigate(['/imprint']);
  // }

  // contact() {
  //   this.router.navigate(['/contact']);
  // }

  // policy() {
  //   this.router.navigate(['/policy']);
  // }

  // error(params: any) {
  //   this.router.navigate(['/error'], params);
  // }




  private logNavigation(action: string, success: boolean, error: any = null) {
    if (success) {
      console.log(`[NavigationService] Navigation to ${action} was successful.`);
    } else {
      console.error(`[NavigationService] Error navigating to ${action}:`, error);
    }
  }

  back() {
    try {
      console.log('[NavigationService] Back button clicked.');
      this.location.back();
      this.logNavigation('back', true);
    } catch (error) {
      this.logNavigation('back', false, error);
    }
  }

  welcome() {
    try {
      console.log('[NavigationService] Navigating to Welcome page.');
      this.router.navigate(['/welcome']);
      this.logNavigation('welcome', true);
    } catch (error) {
      this.logNavigation('welcome', false, error);
    }
  }

  login() {
    try {
      console.log('[NavigationService] Navigating to Login page.');
      this.router.navigate(['/login']);
      this.logNavigation('login', true);
    } catch (error) {
      this.logNavigation('login', false, error);
    }
  }

  register() {
    try {
      console.log('[NavigationService] Navigating to Register page.');
      this.router.navigate(['/register']);
      this.logNavigation('register', true);
    } catch (error) {
      this.logNavigation('register', false, error);
    }
  }

  registerSuccess() {
    try {
      console.log('[NavigationService] Navigating to Register Success page.');
      this.router.navigate(['/register_success']);
      this.logNavigation('register_success', true);
    } catch (error) {
      this.logNavigation('register_success', false, error);
    }
  }

  sendMail() {
    try {
      console.log('[NavigationService] Navigating to Send Mail page.');
      this.router.navigate(['/send_mail']);
      this.logNavigation('send_mail', true);
    } catch (error) {
      this.logNavigation('send_mail', false, error);
    }
  }

  updateUsername() {
    try {
      console.log('[NavigationService] Navigating to Update Username page.');
      this.router.navigate(['/update_username']);
      this.logNavigation('update_username', true);
    } catch (error) {
      this.logNavigation('update_username', false, error);
    }
  }

  profiles() {
    try {
      console.log('[NavigationService] Navigating to Profiles page.');
      this.router.navigate(['/selection']);
      this.logNavigation('profiles', true);
    } catch (error) {
      this.logNavigation('profiles', false, error);
    }
  }

  main() {
    try {
      console.log('[NavigationService] Navigating to Main page.');
      this.router.navigate(['/mainpage']);
      this.logNavigation('mainpage', true);
    } catch (error) {
      this.logNavigation('mainpage', false, error);
    }
  }

  imprint() {
    try {
      console.log('[NavigationService] Navigating to Imprint page.');
      this.router.navigate(['/imprint']);
      this.logNavigation('imprint', true);
    } catch (error) {
      this.logNavigation('imprint', false, error);
    }
  }

  contact() {
    try {
      console.log('[NavigationService] Navigating to Contact page.');
      this.router.navigate(['/contact']);
      this.logNavigation('contact', true);
    } catch (error) {
      this.logNavigation('contact', false, error);
    }
  }

  policy() {
    try {
      console.log('[NavigationService] Navigating to Policy page.');
      this.router.navigate(['/policy']);
      this.logNavigation('policy', true);
    } catch (error) {
      this.logNavigation('policy', false, error);
    }
  }

  error(params: any) {
    try {
      console.log('[NavigationService] Navigating to Error page.');
      this.router.navigate(['/error'], params);
      this.logNavigation('error', true);
    } catch (error) {
      this.logNavigation('error', false, error);
    }
  }


}