import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';

import {User} from './user.model';
import {environment} from '../../../environments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UserAuthent} from './user-authent.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: User;
  private url = `${environment.baseUrl}/api-token-auth/`;
  private userSource = new ReplaySubject<User>(1);
  userActivate$ = this.userSource.asObservable();

  constructor(private http: HttpClient,
              private jwtService: JwtHelperService) {
    this.sendUser();
  }
  /**
   * Authentification /api-token-auth/
   * @param {UserAuthent} user : l'utilisateur a connecté
   * @return any dont token
   */
  logon(user: UserAuthent): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this.http
      .post(this.url, { username: user.username, password: user.password }, {headers})
      .pipe(map(dataJwt => this._authenticated(dataJwt)));
  }
  isAuthenticated() {
    return !this.jwtService.isTokenExpired();
  }
  isTokenExpired() {
    return this.jwtService.isTokenExpired();
  }
  getTokenExpiredDate() {
    return this.jwtService.getTokenExpirationDate();
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token') || '';
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user')) as User;
  }

  sendUser() {
    this.user = this.getUser();
    this.userSource.next(this.user);
  }

  /**
   * Stockage du token et de quelques informations user
   * @param data
   * @private
   */
  private _authenticated(data: any): User {
    console.log(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.userSource.next(data.user as User);
    return data;
  }
}
