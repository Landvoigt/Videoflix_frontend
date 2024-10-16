import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VideoComponent } from './video/video.component';
import { SendMailComponent } from './send-mail/send-mail.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { AuthGuard, RedirectGuard } from './auth/auth.guard';
import { ProfilesComponent } from './profiles/profiles.component';
import { RegisterSuccessComponent } from './register-success/register-success.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { ContactComponent } from './contact/contact.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PolicyComponent } from './policy/policy.component';
import { UpdateUsernameComponent } from './update-username/update-username.component';
import { DashboardComponent } from './mainpage/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' },

    { path: 'welcome', component: FrontpageComponent },
    { path: 'login', component: LoginComponent, canActivate: [RedirectGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [RedirectGuard] },
    { path: 'register_success', component: RegisterSuccessComponent, canActivate: [RedirectGuard] },
    { path: 'send_mail', component: SendMailComponent, canActivate: [RedirectGuard] },
    { path: 'reset_password', component: ResetPasswordComponent, canActivate: [RedirectGuard] },
    { path: 'update_username', component: UpdateUsernameComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

    { path: 'selection', component: ProfilesComponent, canActivate: [AuthGuard] },
    { path: 'mainpage', component: MainpageComponent, canActivate: [AuthGuard] },
    { path: 'video', component: VideoComponent, canActivate: [AuthGuard] },

    { path: 'contact', component: ContactComponent },
    { path: 'imprint', component: ImprintComponent },
    { path: 'policy', component: PolicyComponent },

    { path: 'error', component: ErrorPageComponent },
    { path: '**', redirectTo: '/error' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }