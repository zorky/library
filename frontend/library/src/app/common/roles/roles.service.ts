import {Injectable} from '@angular/core';
import {AuthService} from '../../services/authent/auth.service';

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private authSvc: AuthService) {
  }
}
