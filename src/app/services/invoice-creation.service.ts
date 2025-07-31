import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  name: string;
}

export interface ClientData {
  name: string;
  email: string;
  phone_number: string;
  service: string;
  country_code: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceCreationService {

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>('http://localhost:3000/dropdown-clients', { withCredentials: true });
  }

  postInvoice(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:3000/invoice/submit', data, { withCredentials: true });
  }
}