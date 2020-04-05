import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() layout = 'end center';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  go(url) {
    this.router.navigate([url]);
  }
}
