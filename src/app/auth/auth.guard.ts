import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { Observable } from "rxjs";

export const AuthGuard: CanActivateFn = (): Observable<boolean> => {
    return inject(AuthService).canActivate();
}

export const RedirectGuard: CanActivateFn = (): Observable<boolean> => {
    return inject(AuthService).redirectIfLoggedIn();
}