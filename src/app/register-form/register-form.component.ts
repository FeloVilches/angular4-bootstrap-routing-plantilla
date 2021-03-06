import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Angular2TokenService } from "angular2-token";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html'
})
export class RegisterFormComponent implements OnInit {

  signUpUser = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  };

  errors: string = "";

  loading: boolean = false;

  recaptchaKey: string;

  usernameRegex: RegExp = new RegExp(/^[A-Za-z0-9\-]{2,25}$/);

  captchaResponse: string = "";

  resolved(captchaResponse: string) {
    this.captchaResponse = captchaResponse == null? "" : captchaResponse;
  }

  @Output() onFormResult = new EventEmitter<any>();

  constructor(private tokenAuthSerivce:Angular2TokenService) {
    this.recaptchaKey = environment.recaptchaKey;
  }

  ngOnInit() {}


  onSignUpSubmit(){

    this.signUpUser.email = this.signUpUser.email.trim();
    this.signUpUser.username = this.signUpUser.username.trim();

    if(this.signUpUser.username.length == 0){
      this.errors = "Username is required.";
      return;
    }

    if(this.signUpUser.username.length < 2){
      this.errors = "Username is too short. Minimum is 2 characters.";
      return;
    }

    if(this.signUpUser.username.length > 25){
      this.errors = "Username is too long. Maximum is 25 characters.";
      return;
    }

    if(!this.usernameRegex.test(this.signUpUser.username)){
      this.errors = "Username can only contain letters (A-Z), digits (0-9) and dashes (-).";
      return;
    }

    if(this.signUpUser.email.length == 0){
      this.errors = "Email is required.";
      return;
    }

    if(this.signUpUser.password.length < 8){
      this.errors = "Password is too short.";
      return;
    }

    if(this.signUpUser.password !== this.signUpUser.passwordConfirmation){
      this.errors = "Passwords don't match."
      return;
    }

    this.loading = true;

    this.tokenAuthSerivce.registerAccount({
      nickname: this.signUpUser.username,
      email: this.signUpUser.email,
      password: this.signUpUser.password,
      passwordConfirmation: this.signUpUser.passwordConfirmation,
      'g-recaptcha-response': this.captchaResponse
    }).subscribe(

      res => {
        this.loading = false;
        if (res.status == 200){
          this.onFormResult.emit({signedUp: true, res})
          this.errors = "";
        }
      },

      err => {
        console.log("JSON:");
        console.log(err);
        this.loading = false;

        this.onFormResult.emit({signedUp: false, err});

        this.errors = "There was an unknown error while creating your account.";

        try {
          this.errors = err.json().errors.full_messages[0];
        } catch(e){
          try {
            this.errors = err.json().errors[0];
          } catch(e2){
          }
        }

      });

  }
}
