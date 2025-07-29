import { Component } from '@angular/core';
import { PaymentTrackingService } from '../services/payment-tracking-service';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-verify',
  imports: [],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class Verify {

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  trackingService = inject(PaymentTrackingService);


  ngOnInit() {
    const invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    if (invoiceId) {
      this.updateStatus(invoiceId);
    }
  }

  updateStatus(id: number) {
    this.trackingService.verifySent(id).subscribe({
      next: (res) => console.log('Status updated:', res),
      error: (err) => console.error('Failed to update status:', err),
    });
  }
}

