import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Route, CanLoad} from '@angular/router';
import { Observable } from 'rxjs';
import {UserGroupsService} from '../roles/user-groups.service';
import {UserGroups} from '../roles/usergroups.model';
import {roles} from '../roles/roles.enum';

@Injectable({ providedIn: 'root' })
export class GestionnaireGuard implements CanLoad, CanActivate {
  constructor(private userGrpService: UserGroupsService) {
  }
  canLoad(route: Route): Observable<boolean> {
    return this.isGestionnaire();
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {
    return this.isGestionnaire();
  }

  /**
   * Est-il un gestionnaire ?
   */
  private isGestionnaire(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.userGrpService.connecte$.subscribe(connecte => {
          observer.next(this._gestionnaire(connecte));
          observer.complete();
        }
      );
    });
  }

  /**
   * Un gestionnaire est soit un gestionnaire, soit un admin
   * @param connecte
   * @private
   */
  private _gestionnaire(connecte: UserGroups) {
    return this.userGrpService.hasRole(connecte, roles.gestionnaire) ||
           this.userGrpService.hasRole(connecte, roles.admin);
  }
}
