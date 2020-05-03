import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/authent/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() layout = 'end center';

  constructor(private router: Router,
              public authentSvc: AuthService) { }

  ngOnInit(): void {
  }

  getUser() {
    return `${this.authentSvc?.getUser()?.first_name} ${this.authentSvc?.getUser()?.last_name}`;
  }
  go(url) {
    this.router.navigate([url]);
  }
}
