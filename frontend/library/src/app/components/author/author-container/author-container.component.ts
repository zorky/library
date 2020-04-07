import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Author} from '../../../services';

@Component({
  selector: 'app-author-container',
  templateUrl: './author-container.component.html',
  styleUrls: ['./author-container.component.css']
})
export class AuthorContainerComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AuthorContainerComponent>) { }

  ngOnInit(): void {
  }

  onAuthorUpdated(author: Author) {
    this.dialogRef.close(author);
  }
}
