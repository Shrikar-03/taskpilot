// import { Injectable } from '@angular/core';
// import { CanActivate, CanActivateChild, Router } from '@angular/router';
// import { AuthService } from './services/auth.service';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Observable, of } from 'rxjs';
// import { switchMap, map, catchError } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate, CanActivateChild {

//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private firestore: AngularFirestore
//   ) {}

//   canActivate(): Observable<boolean> {
//     return this.checkUserRole();
//   }

//   canActivateChild(): Observable<boolean> {
//     return this.checkUserRole();
//   }

//   private checkUserRole(): Observable<boolean> {
//     return this.authService.getCurrentUser().pipe(
//       switchMap(user => {
//         if (!user) {
//           this.router.navigate(['/auth']);
//           return of(false);
//         }
//         return this.firestore.collection('users').doc(user.uid).valueChanges().pipe(
//           map((userData: any) => {
//             if (userData) {
//               if (userData.role === 'admin') {
//                 // Allow access to admin notifications
//                 return true;
//               } else if (userData.role === 'employee') {
//                 // Redirect to employee notifications if accessing admin route
//                 this.router.navigate(['/employee-notification']);
//                 return false;
//               }
//             }
//             this.router.navigate(['/auth']);
//             return false;
//           }),
//           catchError(() => {
//             this.router.navigate(['/auth']);
//             return of(false);
//           })
//         );
//       })
//     );
//   }
// }


import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  canActivate(): Observable<boolean> {
    return this.checkUserRole();
  }

  canActivateChild(): Observable<boolean> {
    return this.checkUserRole();
  }

  private checkUserRole(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/auth']);
          return of(false);
        }
        return this.firestore.collection('users').doc(user.uid).valueChanges().pipe(
          map((userData: any) => {
            if (userData) {
              if (userData.role === 'admin') {
                // Allow access to admin notifications
                return true;
              } else if (userData.role === 'employee') {
                // Allow access to employee notifications and redirect if necessary
                if (this.router.url === '/notifications') {
                  this.router.navigate(['/employee-notification']);
                }
                return true;
              }
            }
            this.router.navigate(['/auth']);
            return false;
          }),
          catchError(() => {
            this.router.navigate(['/auth']);
            return of(false);
          })
        );
      })
    );
  }
}
