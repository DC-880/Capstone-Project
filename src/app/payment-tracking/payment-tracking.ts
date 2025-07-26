import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { PaymentTrackingService } from '../services/payment-tracking-service';
import { Observable, combineLatest, map } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { InvoiceCreationService } from '../services/invoice-creation.service';


export interface Invoice {
  id: number;
  client_id: number;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  created_on: Date;
}

export interface DisplayInvoice {
  id: number;
  client_name: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  created_on: Date;
}

@Component({
  selector: 'app-payment-tracking',
  standalone: true,
  imports: [RouterLink, Navbar, CommonModule],
  templateUrl: './payment-tracking.html',
  styleUrl: './payment-tracking.css',
animations: [
  trigger('fade', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('500ms ease-in', style({ opacity: 0 }))
    ])
  ])
]
})
export class PaymentTracking implements OnInit {

  invoiceService = inject(InvoiceCreationService);
  trackingService = inject(PaymentTrackingService);

  displayInvoices$!: Observable<DisplayInvoice[]>;

  ngOnInit() {
    const invoices$ = this.trackingService.getInvoices() as Observable<Invoice[]>;
    const clients$ = this.invoiceService.getClients();

    this.displayInvoices$ = combineLatest([invoices$, clients$]).pipe(
      map(([invoices, clients]) => {
        const clientMap = new Map(clients.map(client => [client.id, client.name]));
        return invoices.map(invoice => ({
          ...invoice,
          client_name: clientMap.get(invoice.client_id) ?? 'Unknown Client'
        }));
      })
    );
  }

}
