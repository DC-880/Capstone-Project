import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { LoginService } from '../services/login-service';



@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {

  loginService = inject(LoginService);

  signInForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  })

  submitSignIn() {
    if (this.signInForm.valid){
       this.loginService.login(this.signInForm.value).subscribe(result => {
        console.log(result);
       })
    }
   
  }

}
