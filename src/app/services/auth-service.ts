import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signIn(username: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:3000/sign-in', { username, password }, { withCredentials : true})
      
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

    authStatus() {
    return this.http.get('http://localhost:3000/auth-status', { withCredentials: true });
    }

  // test() {
  //   const headers = {'Authorization': `${this.getToken()}`};
  //   return this.http.post<{ token: string }>('http://localhost:3000/sign-in', { headers }, { withCredentials : true})
      
  // }

}
  
