import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  signIn(username: string, password: string) {
    return this.http.post<{ token: string }>('http://localhost:3000/sign-in', { username, password }, { withCredentials: true })
  }


  authStatus() {
    return this.http.get('http://localhost:3000/auth-status', { withCredentials: true });
  }

  logout() {
    // With HttpOnly cookies, the browser manages the cookie, and JavaScript can't delete it.
    // This request tells the server to clear the cookie.
    return this.http.post('http://localhost:3000/logout', {}, { withCredentials: true });
  }

  // test() {
  //   const headers = {'Authorization': `${this.getToken()}`};
  //   return this.http.post<{ token: string }>('http://localhost:3000/sign-in', { headers }, { withCredentials : true})

  // }

}

