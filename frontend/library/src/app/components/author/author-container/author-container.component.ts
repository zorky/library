import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Author} from '../../../services';

@Component({
  selector: 'app-author-container',
  templateUrl: './author-container.component.html',
  styleUrls: ['./author-container.component.css']
})
export class AuthorContainerComponent implements OnInit {
  author = this.data;
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: Author,
              public dialogRef: MatDialogRef<AuthorContainerComponent>) {
  }

  ngOnInit(): void {
  }

  onAuthorUpdated(author: Author) {
    this.dialogRef.close(author);
  }
}
