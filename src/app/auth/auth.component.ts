
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  signUpName: string = '';
  signUpEmail: string = '';
  signUpPassword: string = '';
  signInEmail: string = '';
  signInPassword: string = '';

  errorMessage: string = '';

  isPasswordLongEnough: boolean = false;
  hasNumber: boolean = false;
  hasSpecialCharacter: boolean = false;
  showPasswordCriteria: boolean = false;
  passwordFocused: boolean = false;

  constructor(private authService: AuthService) {
    this.authService.errorMessage.subscribe(message => {
      this.errorMessage = message;
    });
  }

  signUp() {
    const container = document.getElementById('container');
    if (container) {
      container.classList.add('right-panel-active');
    }
  }

  signIn() {
    const container = document.getElementById('container');
    if (container) {
      container.classList.remove('right-panel-active');
    }
  }

  async onSignUp() {
    if (this.isFormValid()) {
      try {
        await this.authService.signUp(this.signUpEmail, this.signUpPassword, this.signUpName);
        this.showModal(); // Show the sign-up success modal
      } catch (error) {
        console.error('Sign-up error:', error);
      }
    } else {
      this.showPasswordCriteria = true;
      this.errorMessage = 'Please ensure all fields are valid.';
    }
  }

  async onSignIn() {
    try {
      await this.authService.signIn(this.signInEmail, this.signInPassword);
    } catch (error) {
      console.error('Sign-in error:', error);
      this.errorMessage = 'Sign-in failed. Please try again.';
    }
  }

  clearErrorMessage() {
    this.errorMessage = '';
  }

  showModal() {
    const modal = document.getElementById('signupSuccessModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  continueToSignIn() {
    const modal = document.getElementById('signupSuccessModal') as HTMLElement;
    modal.style.display = 'none';
    this.signIn(); // Switch to sign-in panel after closing the modal
  }

  validatePassword() {
    const password = this.signUpPassword;
    this.isPasswordLongEnough = password.length >= 5;
    this.hasNumber = /\d/.test(password);
    this.hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.validateForm();
  }

  validateForm() {
    this.showPasswordCriteria = true;
    return this.signUpName && this.signUpEmail && this.signUpPassword && this.isFormValid();
  }

  isFormValid() {
    return this.isPasswordLongEnough && this.hasNumber && this.hasSpecialCharacter;
  }

  onPasswordFocus() {
    this.passwordFocused = true;
  }

  onPasswordBlur() {
    this.passwordFocused = false;
  }
}
