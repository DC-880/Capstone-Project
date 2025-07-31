import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientManagementService } from '../services/client-management-service';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { Navbar } from '../navbar/navbar';
import { InvoiceCreationService, Client } from '../services/invoice-creation.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-edit-client',
  imports: [Navbar, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './edit-client.html',
  styleUrl: './edit-client.css'
})
export class EditClient {
    invoiceService = inject(InvoiceCreationService);
  clientService = inject(ClientManagementService);
  private fb = inject(FormBuilder);

  successMessage: string | null = null;
  clientEditForm!: FormGroup;
  countries: { name: string; code: string; callingCode: string; }[] = [];
  clients$!: Observable<Client[]>;

  ngOnInit(): void {
    

    
    this.countries = getCountries().map(country => ({
      code: country,
      name: new Intl.DisplayNames(['en'], { type: 'region' }).of(country)!,
      callingCode: getCountryCallingCode(country as CountryCode)
    })).sort((a, b) => a.name.localeCompare(b.name));

    this.clientEditForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required], 
      country_code: ['US', Validators.required], 
      phone_number: ['', Validators.required],
      service: ['', Validators.required]
    });

          this.clientService.getClientById(this.clientId).subscribe((client) => {
    this.clientEditForm.patchValue({
      name: client.name,
      email: client.email,
      country_code: client.country_code,
      phone_number: client.phone_number,
      service: client.service
    });
  });

    const countryControl = this.clientEditForm.get('country_code');
    const phoneControl = this.clientEditForm.get('phone_number');

    if (countryControl && phoneControl) {
      const initialCallingCode = getCountryCallingCode(countryControl.value as CountryCode);
      phoneControl.setValue(`+${initialCallingCode} `);

      countryControl.valueChanges.subscribe(countryCode => {
        if (countryCode) {
          const callingCode = getCountryCallingCode(countryCode as CountryCode);
          phoneControl.setValue(`+${callingCode} `);
        }
      });
    }

    this.clients$ = this.invoiceService.getClients();
  }

  submitEdit() {
    if (this.clientEditForm.valid) {
      const rawPhoneNumber = this.clientEditForm.get('phone_number')?.value;
      const countryCode = this.clientEditForm.get('country_code')?.value as CountryCode;

      const phoneNumber = parsePhoneNumberFromString(rawPhoneNumber, countryCode);

      if (phoneNumber && phoneNumber.isValid()) {
        const clientData = {
          name: this.clientEditForm.get('name')?.value,
          email: this.clientEditForm.get('email')?.value,
          phone_number: phoneNumber.format('E.164'), 
          service: this.clientEditForm.get('service')?.value,
        };

        this.clientService.postClient(clientData).subscribe({
          next: (response) => {
            console.log('Client Added Successfully:', response);
            this.successMessage = "Client Updated Successfully!";
            this.clientEditForm.reset({ country_code: 'US' }); 
            setTimeout(() => this.successMessage = null, 5000);
          },
          error: (error) => {
            console.error('Error posting client:', error);
          }
        });
      } else {
        this.clientEditForm.get('phone_number')?.setErrors({ 'invalidPhoneNumber': true });
      }
    }
  }

}
