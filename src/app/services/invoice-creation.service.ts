import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceCreationService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/dropdown-clients`, { withCredentials: true });
  }

  postInvoice(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/invoice/submit`, data, { withCredentials: true });
  }
}