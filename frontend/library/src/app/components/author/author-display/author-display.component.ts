import {Component, Input, OnInit} from '@angular/core';
import {Author} from '../../../services';

@Component({
  selector: 'app-author-display',
  templateUrl: './author-display.component.html',
  styleUrls: ['./author-display.component.css']
})
export class AuthorDisplayComponent implements OnInit {
  @Input() author: Author;

  constructor() { }

  ngOnInit(): void {
  }

}
