import { Component, OnInit } from '@angular/core';
import {Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {UserAuthent} from '../../services/authent/user-authent.model';
import {AuthService} from '../../services/authent/auth.service';
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-cm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  model = {} as UserAuthent;
  message = { message: '', label: '', color: '', icon: '' };
  loading = false;

  constructor(private authService: AuthService,
              private router: Router) {
    if (authService.isAuthenticated()) {
      authService.logout();
    }
    this.message = null;
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/']);
    }
  }

  canValidate() {
    if (this.loading) {
      return false;
    }

    return !(!this.model.username || !this.model.password);
  }

  login() {
    this.loading = true;
    this.authService.logon(this.model)
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => {
        if (data.token) {
          this.router.navigate(['/']);
          }
      },
      error => {
        this.loading = false;
        if (error instanceof HttpErrorResponse && error.status === 400) {
          const message =  error.error.non_field_errors[0];
          this.message = {
            message,
            label: '',
            color: 'red',
            icon: 'error'
          };
        } else {
          throw error;
        }
      }
    );
  }

  closeAlert() {
    this.message = null;
  }
}
