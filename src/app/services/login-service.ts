import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  http = inject(HttpClient);


  login(data: {}) {
    return this.http.post('http://localhost:3000/sign-in/', data);
  }
}
