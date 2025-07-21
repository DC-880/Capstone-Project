import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Client, InvoiceCreationService } from '../services/invoice-creation.service';


@Component({
  selector: 'app-invoice-creation',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './invoice-creation.html',
  styleUrl: './invoice-creation.css'
})
export class InvoiceCreation implements OnInit {

  invoiceService = inject(InvoiceCreationService);

  invoiceForm = new FormGroup({
    // This control will now hold the client's ID, not their name.
    client_id: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
    dueDate: new FormControl('', Validators.required)
  });

  options$!: Observable<Client[]>;

  ngOnInit() {
    // Fetch clients for the dropdown when the component initializes.
    this.options$ = this.invoiceService.getClients();
  }

  submitInvoice() {
    if (this.invoiceForm.valid) {
      // The form value now directly matches the payload expected by the backend.
      // The `client_id` form control holds the ID of the selected client.
      this.invoiceService.postInvoice(this.invoiceForm.value).subscribe({
        next: (response) => {
          console.log('Invoice posted successfully:', response);
          // Optionally, reset the form or navigate away
          this.invoiceForm.reset();
        },
        error: (error) => {
          console.error('Error posting invoice:', error);
        }
      });
    }
  }

}
