import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../services/invoice-creation.service';
import { ClientData } from '../services/invoice-creation.service';


@Injectable({
  providedIn: 'root'
})
export class ClientManagementService {

  constructor(private http: HttpClient) { }

  postClient(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:3000/clients/add', data, { withCredentials: true });
  }

  updateClient(clientId: number, data: any): Observable<any> {
    return this.http.put<any>(`http://localhost:3000/clients/edit/${clientId}`, data, { withCredentials: true });
  }


  getClientById(clientId: number): Observable<ClientData> {
    return this.http.get<ClientData>(`http://localhost:3000/clients/${clientId}`, { withCredentials: true });
  }
}
