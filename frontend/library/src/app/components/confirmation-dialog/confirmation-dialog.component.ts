import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SafeHtml} from '@angular/platform-browser';
import {actionTypeEnum, DialogData} from './dialog-data.model';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  dialogData: DialogData = new DialogData();
  iconPrefix: SafeHtml = '';
  form: FormGroup;
  contentData: string;
  icon = '';
  actionType = actionTypeEnum;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
              private fb: FormBuilder) {
    this.contentData = null;
    if (data) {
      this.dialogData = data;
      if (this.dialogData.iconType) {
        this.icon = this.dialogData.iconType;
        this.iconPrefix = this.dialogData.iconType;
      }
    }
  }

  ngOnInit(): void {
  }
  save() {
    this.dialogRef.close(true);
  }
}
