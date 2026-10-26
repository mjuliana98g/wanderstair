import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth";

// --------------------------------------------------
// AUTH GUARD
// --------------------------------------------------

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const signedIn = await auth.hasSession();
    return signedIn ? true : router.createUrlTree(['/sign-in']);
};