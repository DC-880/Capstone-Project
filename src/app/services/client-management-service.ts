import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../services/invoice-creation.service';

@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {

  constructor(private http: HttpClient) { }

    postClient(data: any): Observable<any> {
      return this.http.post<any>('http://localhost:3000/clients/add', data, { withCredentials: true });
    }

    editClient(clientId: number): Observable<any> {
      return this.http.post(`http://localhost:3000/clients/remove/${clientId}`, { withCredentials: true });
    }

    getClientById(id: number): Observable<Client> {
  return this.http.get<Client>(`http://localhost:3000/clients/edit/${id}`);
}
}
