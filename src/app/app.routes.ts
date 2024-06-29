import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VideoComponent } from './video/video.component';
import { SendMailComponent } from './send-mail/send-mail.component';
import { NgModule } from '@angular/core';
import { ErrorPageComponent } from './error-page/error-page.component';
import { AuthGuard, RedirectIfLoggedInGuard } from './auth/auth.guard';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { RegisterSuccessComponent } from './register-success/register-success.component';
import { FrontpageComponent } from './frontpage/frontpage.component';

export const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' },

    { path: 'welcome', component: FrontpageComponent },
    { path: 'login', component: LoginComponent, canActivate: [RedirectIfLoggedInGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [RedirectIfLoggedInGuard] },
    { path: 'register_success', component: RegisterSuccessComponent, canActivate: [RedirectIfLoggedInGuard] },
    { path: 'send_mail', component: SendMailComponent, canActivate: [RedirectIfLoggedInGuard] },
    { path: 'reset_password', component: ResetPasswordComponent, canActivate: [RedirectIfLoggedInGuard] },
    
    { path: 'selection', component: UserSelectionComponent, canActivate: [AuthGuard] },
    { path: 'mainpage', component: MainpageComponent, canActivate: [AuthGuard] },
    { path: 'video', component: VideoComponent, canActivate: [AuthGuard] },

    { path: 'error', component: ErrorPageComponent },
    { path: '**', redirectTo: '/error' }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }