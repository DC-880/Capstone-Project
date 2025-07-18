import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { LoginService } from '../services/login-service';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {

  loginService = inject(LoginService);
  authService = inject(AuthService);
  router = inject(Router);

  signInForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })

submitSignIn() {
  
  if (this.signInForm.valid) {
    const { username, password } = this.signInForm.value;
    const safeUsername = username ?? '';
    const safePassword = password ?? '';
    
    this.loginService.login({ username: safeUsername, password: safePassword }).subscribe({
      next: (data) => {
        console.log('Signed in Successfully', data);

        // After successful login, check the authentication status.
        this.authService.authStatus().subscribe(() => {
          console.log('Authentication status checked successfully.');

          // Navigate to the home page after successful authentication check.
          this.router.navigate(['/home']);
        });
      },
      error: (err) => {
        console.error('Login failed:', err);
      }
    });
  } else {
    console.log('signInForm invalid');
  }
}
}
