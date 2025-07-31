import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientManagementService } from '../services/client-management-service';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { Navbar } from '../navbar/navbar';
import { InvoiceCreationService, Client, ClientData } from '../services/invoice-creation.service';
import { first, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-edit-client',
  imports: [Navbar, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './edit-client.html',
  styleUrl: './edit-client.css'
})
export class EditClient {
  clientId!: number;
  route = inject(ActivatedRoute);

  private initializingForm = true;


  invoiceService = inject(InvoiceCreationService);
  clientService = inject(ClientManagementService);
  private fb = inject(FormBuilder);

  successMessage: string | null = null;
  clientEditForm!: FormGroup;
  countries: { name: string; code: string; callingCode: string; }[] = [];
  clients$!: Observable<Client[]>;
  clientData!: Observable<ClientData[]>;


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

    this.clientId = Number(this.route.snapshot.paramMap.get('id'));


    this.clientService.getClientById(this.clientId).pipe(first()).subscribe({
      next: (clientData: ClientData) => {
        console.log(clientData);
        this.clientEditForm.patchValue({
          name: clientData.name,
          email: clientData.email,
          country_code: clientData.country_code,
          phone_number: clientData.phone_number,
          service: clientData.service
        });
        this.initializingForm = false;


        const countryControl = this.clientEditForm.get('country_code');
        const phoneControl = this.clientEditForm.get('phone_number');

        if (countryControl && phoneControl) {

          countryControl.valueChanges.subscribe(countryCode => {
            if (this.initializingForm) return;
            if (countryCode && !phoneControl.dirty) {
              const callingCode = getCountryCallingCode(countryCode as CountryCode);
              phoneControl.setValue(`+${callingCode} `);
            }
          });
        }


      },
      error: (error) => {
        console.error('Error fetching client data:', error);
      }
    });



  }

  submitEdit() {
    console.log('submit triggered');
    if (this.clientEditForm.valid) {
      const rawPhoneNumber = this.clientEditForm.get('phone_number')?.value;
      const countryCode = this.clientEditForm.get('country_code')?.value as CountryCode;

      const phoneNumber = parsePhoneNumberFromString(rawPhoneNumber, countryCode);
    console.log('client form is valid');
      if (phoneNumber && phoneNumber.isValid()) {
        const editData = {
          name: this.clientEditForm.get('name')?.value,
          email: this.clientEditForm.get('email')?.value,
          phone_number: phoneNumber.format('E.164'),
          service: this.clientEditForm.get('service')?.value,
        };

        console.log('Submitting updated data:', editData);
        console.log('To URL:', `/clients/edit/${this.clientId}`);
        this.clientService.updateClient(this.clientId, editData).subscribe({
          next: (response) => {
            console.log('Client Updated Successfully:', response);
            // this.clientEditForm.reset({ country_code: 'US' });
            setTimeout(() => this.successMessage = null, 5000);
          },
          error: (error) => {
            console.error('Error updating client:', error);
          }
        });
      } else {
        this.clientEditForm.get('phone_number')?.setErrors({ 'invalidPhoneNumber': true });
      }
    }
  }

}
