import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.scss']
})
export class LayoutHeaderComponent implements OnInit {
  @Input() titlePath: string[] = [];
  @Input() iconRacine = '';
  @Input() separator = '>';
  @Input() card = true;

  constructor() { }

  ngOnInit() {
  }

}
