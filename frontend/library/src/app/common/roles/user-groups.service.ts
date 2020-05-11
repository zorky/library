import {Injectable, OnDestroy} from '@angular/core';
import {AuthService} from '../../services/authent/auth.service';
import {catchError, filter, isEmpty, mergeMap, tap} from "rxjs/operators";
import {Observable, of, ReplaySubject} from "rxjs";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {UserGroups} from './usergroups.model';
import {environment} from '../../../environments/environment';
import {SubSink} from '../../services/subsink';

@Injectable({ providedIn: 'root' })
export class UserGroupsService implements OnDestroy {
  private url =  `${environment.baseUrl}/library/usergroups/`;
  private subSink = new SubSink();
  private connecteSource = new ReplaySubject<UserGroups>(1);
  connecte$ = this.connecteSource.asObservable();

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.subSink.sink = this.authService.userActivate$
      .pipe(filter(user => !!user),
            mergeMap(user => this.get(user.username)))
      .subscribe(connecte => this.connecteSource.next(connecte as UserGroups));
  }

  /**
   * Le connecte a-t-il tel rôle / groupe ?
   * @param connecte : l'utilisateur à tester
   * @param role : rôle / groupe à tester sur le connecté
   */
  hasRole(connecte: UserGroups, role: string): boolean {
    return connecte && 'groups' in connecte && connecte.groups.some((name) => name === role);
  }

  private get(uid: string): Observable<UserGroups> {
    return this.http
      .get<UserGroups>(`${this.url}?uid=${uid}`)
      .pipe(catchError( (err: HttpErrorResponse ) => {
        if (err && err.status === 401 && err.error && 'detail' in err.error && err.error.detail === 'Signature has expired.') {
          console.error('An error occurred:', err);
        }
        return of(null);
      }));

  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
