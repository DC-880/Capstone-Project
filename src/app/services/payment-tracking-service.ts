import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentTrackingService {

  constructor(private http: HttpClient) { }


  getInvoices() {
    return this.http.get('http://localhost:3000/tracking', { withCredentials: true });
  }

  markReceived(invoiceId: number) {
    return this.http.patch(`http://localhost:3000/tracking/${invoiceId}`, {}, { withCredentials: true, responseType: 'text'});
  }
}
