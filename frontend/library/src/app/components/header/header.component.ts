import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/authent/auth.service';
import {UserGroupsService} from '../../common/roles/user-groups.service';
import {UserGroups} from '../../common/roles/usergroups.model';
import {SubSink} from '../../services/subsink';
import {roles} from '../../common/roles/roles.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() layout = 'end center';
  connecte: UserGroups;
  subSink = new SubSink();
  constructor(private router: Router,
              public authentSvc: AuthService,
              private userGrpsSvc: UserGroupsService) { }

  ngOnInit(): void {
    this.subSink.sink = this.userGrpsSvc.connecte$.subscribe((connecte) => this.connecte = connecte);
  }

  getUser() {
    return `${this.authentSvc?.getUser()?.first_name} ${this.authentSvc?.getUser()?.last_name}`;
  }
  go(url) {
    this.router.navigate([url]);
  }
  canAcces() {
    return this.connecte && this.userGrpsSvc.hasRole(this.connecte, roles.gestionnaire);
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
