import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Client, InvoiceCreationService } from '../services/invoice-creation.service';
import { trigger, transition, style, animate } from '@angular/animations';




@Component({
  selector: 'app-invoice-creation',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './invoice-creation.html',
  styleUrl: './invoice-creation.css',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
  ]
})
export class InvoiceCreation implements OnInit {

  invoiceService = inject(InvoiceCreationService);

  invoiceForm = new FormGroup({
    client_id: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
    dueDate: new FormControl('', Validators.required)
  });

  options$!: Observable<Client[]>;

  successMessage: string | null = null;


  ngOnInit() {
    this.options$ = this.invoiceService.getClients();
  }

  submitInvoice() {
    if (this.invoiceForm.valid) {
      this.invoiceService.postInvoice(this.invoiceForm.value).subscribe({
        next: (response) => {
          console.log('Invoice posted successfully:', response);
          this.successMessage = "Invoice posted successfully!";
          this.invoiceForm.reset();
          setTimeout(() => this.successMessage = null, 5000);
        },
        error: (error) => {
          console.error('Error posting invoice:', error);
        }
      });
    }
  }

}
