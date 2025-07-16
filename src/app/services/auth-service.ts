import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signIn(username: string, password: string) {
    return this.http.post<{ token: string }>('http://your-backend-url/sign-in', { username, password }, { withCredentials : true})
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          console.log('Token stored:', res.token);
        },
        error: (err) => {
          console.error('Login error:', err);
        }
      });
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
  

