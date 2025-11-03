import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AfterViewInit, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})



export class LoginComponent implements AfterViewInit{
  public loginError!: string;
  
  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;

  public loginForm: { email: string; password: string } = {
    email: '',
    password: '',
  };

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  public handleLogin(event: Event) {
    event.preventDefault();
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.login(this.loginForm).subscribe({
        next: () => this.router.navigateByUrl('/app/dashboard'),
        error: (err: any) => (this.loginError = err.error.description),
      });
    }
  }
  
  ngAfterViewInit(): void {

    (window as any).google.accounts.id.initialize({
      client_id: '813679126446-526bvao7rlou41g1r0g6dgu4fu41tk1d.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCredential(response.credential),
    });

     (window as any).google.accounts.id.renderButton(
      document.getElementById('google-signin-button')!,
      { theme: 'outline', size: 'large' }
    );
  }

  private decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  handleGoogleCredential(token: string) {
    // Decode the JWT token to get user info
    const decoded = this.decodeJwtToken(token);
    if (!decoded) {
      this.loginError = 'Error processing Google authentication.';
      return;
    }

    const googleUser = {
      name: decoded.given_name || '',
      lastname: decoded.family_name || '',
      email: decoded.email || '',
      photoUrl: decoded.picture || '', // Match backend field name
      password: decoded.email // Use email as password for backend
    };

    // Try to register/login with Google
    this.authService.loginWithGoogle(googleUser).subscribe({
      next: (response: any) => {
        // If registration successful, assume login and redirect to dashboard
        this.router.navigateByUrl('/app/dashboard');
      },
      error: (err: any) => {
        // If user already exists or other error, show error
        this.loginError = err.error?.message || 'Error with Google authentication.';
      },
    });
  }

}
