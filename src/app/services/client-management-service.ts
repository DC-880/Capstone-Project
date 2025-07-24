import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {

  constructor(private http: HttpClient) { }

    postClient(data: any): Observable<any> {
      return this.http.post<any>('http://localhost:3000/clients/add', data, { withCredentials: true });
    }
}
