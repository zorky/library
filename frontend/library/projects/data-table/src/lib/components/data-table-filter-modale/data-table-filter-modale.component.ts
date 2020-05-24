import {Component, Inject, OnInit } from '@angular/core';
import {DialogPosition, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ComponentItem} from '../dynamic-core-components/component-item';

@Component({
  selector: 'mat-filter-modale',
  templateUrl: './data-table-filter-modale.component.html',
  styleUrls: ['./data-table-filter-modale.component.scss']
})
export class DataTableFilterModaleComponent implements OnInit {
  component: ComponentItem = null;
  position: DialogPosition = null;

  outputDataComponent: any = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<any>) {
    if (data) {
      const triggerElementRef = data.trigger;
      const rect = triggerElementRef.nativeElement.getBoundingClientRect();

      let left = 0;
      let top = 0;
      switch (data.position) {
        case 'left':
          left = -220;
          break;
        case 'right':
          left = 40;
          break;
        case 'top':
          top = -150;
          break;
        case 'bottom':
        default:
          top = 40;
          break;
      }
      this.position = {
        left: `${rect.left + left}px`,
        top: `${rect.top + top}px`
      };
      this.component = data.component;
    }
  }

  ngOnInit() {
    this.dialogRef.afterClosed().subscribe((v) => {
    });
  }

  onClick(data) {
    if (data && this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
