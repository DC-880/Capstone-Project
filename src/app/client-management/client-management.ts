import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientManagementService } from '../services/client-management-service';
import { trigger, transition, style, animate } from '@angular/animations';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './client-management.html',
  styleUrl: './client-management.css',
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
export class ClientManagement implements OnInit {

  clientService = inject(ClientManagementService);
  private fb = inject(FormBuilder);

  successMessage: string | null = null;
  clientForm!: FormGroup;
  countries: { name: string; code: string; callingCode: string; }[] = [];

  ngOnInit(): void {
    // Populate the country list for the dropdown
    this.countries = getCountries().map(country => ({
      code: country,
      name: new Intl.DisplayNames(['en'], { type: 'region' }).of(country)!,
      callingCode: getCountryCallingCode(country as CountryCode)
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Initialize the form
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required], // add [Validators.email] later
      country_code: ['US', Validators.required], // Default to US
      phone_number: ['', Validators.required],
      service: ['', Validators.required]
    });

    // Logic to update phone number input when country changes
    const countryControl = this.clientForm.get('country_code');
    const phoneControl = this.clientForm.get('phone_number');

    if (countryControl && phoneControl) {
      // Set initial value for the phone number based on the default country
      const initialCallingCode = getCountryCallingCode(countryControl.value as CountryCode);
      phoneControl.setValue(`+${initialCallingCode} `);

      // Subscribe to country changes to update the phone prefix automatically
      countryControl.valueChanges.subscribe(countryCode => {
        if (countryCode) {
          const callingCode = getCountryCallingCode(countryCode as CountryCode);
          phoneControl.setValue(`+${callingCode} `);
        }
      });
    }
  }

  submitClient() {
    if (this.clientForm.valid) {
      const rawPhoneNumber = this.clientForm.get('phone_number')?.value;
      const countryCode = this.clientForm.get('country_code')?.value as CountryCode;

      const phoneNumber = parsePhoneNumberFromString(rawPhoneNumber, countryCode);

      if (phoneNumber && phoneNumber.isValid()) {
        const clientData = {
          name: this.clientForm.get('name')?.value,
          email: this.clientForm.get('email')?.value,
          phone_number: phoneNumber.format('E.164'), // Store in standard E.164 format
          service: this.clientForm.get('service')?.value,
        };

        this.clientService.postClient(clientData).subscribe({
          next: (response) => {
            console.log('Client Added Successfully:', response);
            this.successMessage = "Client Added Successfully!";
            this.clientForm.reset({ country_code: 'US' }); 
            setTimeout(() => this.successMessage = null, 5000);
          },
          error: (error) => {
            console.error('Error posting client:', error);
          }
        });
      } else {
        this.clientForm.get('phone_number')?.setErrors({ 'invalidPhoneNumber': true });
      }
    }
  }
}
