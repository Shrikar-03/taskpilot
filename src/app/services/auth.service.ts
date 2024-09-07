import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  errorMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
  signUpMessage: BehaviorSubject<string> = new BehaviorSubject<string>('');
  user$!: Observable<any>;
  private userEmail: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.pipe(
      map(user => {
        if (user) {
          this.userEmail.next(user.email);
        } else {
          this.userEmail.next(null);
        }
      })
    ).subscribe();
  }

  getUserEmail(): Observable<string | null> {
    return this.userEmail.asObservable();
  }
  async signUp(email: string, password: string, name: string) {
    try {
      // Create user in Firebase Authentication
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = credential.user;

      // Add user to Firestore users collection with role 'employee'
      if (user) {
        const userData = {
          email: user.email,
          role: 'employee'
        };
        await this.firestore.collection('users').doc(user.uid).set(userData);

        // Add user to Firestore employees collection with name
        const employeeData = {
          email: user.email,
          name: name
        };
        await this.firestore.collection('employees').doc(user.uid).set(employeeData);

        this.signUpMessage.next('Sign-up successful! Please sign in.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      this.errorMessage.next('Sign-up failed. Please try again.');
    }
  }

  async signIn(email: string, password: string) {
    try {
      // Sign in user with Firebase Authentication
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = credential.user;

      if (user) {
        const userDoc = await this.firestore.collection('users').doc(user.uid).get().toPromise();
        if (userDoc && userDoc.exists) {
          const userData: any = userDoc.data();
          if (userData && userData.role === 'admin') {
            this.router.navigate(['/task']);
          } else if (userData && userData.role === 'employee') {
            this.router.navigate(['/employee']);
          } else {
            this.errorMessage.next('Role not assigned. Please contact support.');
          }
        } else {
          this.errorMessage.next('No user document found in Firestore.');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      this.errorMessage.next('Sign-in failed. Incorrect email or password.');
    }
  }

  async signOut() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  async forgotPassword(email: string) {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      // Optionally, handle success message or logging
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Propagate error message to components
      this.errorMessage.next('Error sending password reset email. Please try again.');
    }
  }

  getCurrentUser() {
    return this.afAuth.authState;
  }
  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  } 
}
