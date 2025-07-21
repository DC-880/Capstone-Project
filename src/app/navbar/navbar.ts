import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';


@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

authService = inject(AuthService);
router = inject(Router);



  signOut() {
    this.authService.logout().subscribe({
      next: (data) => {
        console.log('Signed out successfully', data);
        this.router.navigate(['/sign-in']);
      },
      error: (err) => {
        console.error('Sign out failed:', err)
        }
  })
}

}
