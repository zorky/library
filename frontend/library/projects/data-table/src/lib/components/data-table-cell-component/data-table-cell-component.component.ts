import {Component, ComponentFactoryResolver, Input, OnDestroy, OnInit, Optional, Type, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';

import {ColumnComponentItem} from '../dynamic-core-components/component-item';
import {HostViewHostDirective} from '../../directives';

import {ColumnDataTable} from '../../interfaces/data-table-column';
import {ColumnComponent} from '../../interfaces/component-column-interface.component';

@Component({
  selector: 'mat-data-table-cell-component',
  templateUrl: './data-table-cell-component.component.html',
  styleUrls: ['./data-table-cell-component.component.css']
})
export class DataTableCellComponentComponent implements OnInit, OnDestroy {
  @Input() component: ColumnComponentItem;
  @Input() column: ColumnDataTable;
  @Input() row: any;
  @ViewChild(HostViewHostDirective, {static: true}) hostViewContainer: HostViewHostDirective;

  subscription: Subscription;
  componentInitialized = false;

  constructor(@Optional() public dialogRef: MatDialogRef<any>,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }
  ngOnInit(): void {
    this.loadComponent();
  }
  /**
   * Initialisation du component et chargement
   */
  loadComponent() {
    if (this.component && this.hostViewContainer && this.hostViewContainer.viewContainerRef) {
      const viewContainerRef = this.hostViewContainer.viewContainerRef;
      if (viewContainerRef) {
        viewContainerRef.clear();

        const item = this.component;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
        const componentRef = viewContainerRef.createComponent(componentFactory);
        const cellComponent = componentRef.instance as ColumnComponent;
        cellComponent.name = item.name;
        cellComponent.column = this.column.column;
        cellComponent.data = item.data;
        cellComponent.input = this.row;
        cellComponent.subject = item.subject;
        cellComponent.subject$ = item.subject$;
        this.componentInitialized = true;
        componentRef.onDestroy(() =>  {
          if (this.subscription) {
            this.subscription.unsubscribe();
            this.componentInitialized = false;
          }
        });

        componentRef.changeDetectorRef.detectChanges();
      }
    }
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
