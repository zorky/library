import {
  Component, Input, ViewChild, ComponentFactoryResolver, OnDestroy,
  OnChanges, SimpleChanges, OnInit, Optional, Output, EventEmitter
} from '@angular/core';
import {DialogPosition, MatDialogRef} from '@angular/material/dialog';
import {Subscription} from 'rxjs';
import {ComponentItem} from '../dynamic-core-components/component-item';
import {HostViewHostDirective} from '../../directives';
import {HeaderComponent} from '../../interfaces/component-header-interface.component';

/**
 * Component d'injection / container du component de ColumnDataTable.headerComponent
 * Se charge d'instancier le component à mettre et de l'activer
 * Placé dans data-table.component.html / <mat-header-cell>
 */
@Component({
  selector: 'mat-data-table-header-component',
  templateUrl: `./data-table-header.component.html`,
  styles: []
})
export class DataTableHeaderComponent implements OnInit, OnDestroy {
  @Input() component: ComponentItem;
  @Input() position: DialogPosition;
  @Output() onClick = new EventEmitter();

  /**
   * TODO : Angular 7 => 9
   * raison : https://angular.io/guide/static-query-migration#is-there-a-case-where-i-should-use-static-true
   * "creating embedded views on the fly"
   * static: true
   */
  @ViewChild(HostViewHostDirective, {static: true}) hostViewContainer: HostViewHostDirective;

  subscription: Subscription;

  componentInitialized = false;

  constructor(@Optional() public dialogRef: MatDialogRef<any>,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.loadComponent();
    this.changePosition();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Fermeture de la dialog
   */
  public close() {
    if (this.dialogRef) {
      this.componentInitialized = false;
      this.dialogRef.close();
    }
  }

  /**
   * Positionnement avec les coordonnées données
   */
  changePosition() {
    if (this.dialogRef) {
      this.dialogRef.updatePosition(this.position);
    }
  }

  /**
   * Initialisation du component et chargement
   */
  loadComponent() {
    if (this.component && this.hostViewContainer && this.hostViewContainer.viewContainerRef) {
      const viewContainerRef = this.hostViewContainer.viewContainerRef;
      if (viewContainerRef) {
        viewContainerRef.clear();

        const adItem = this.component;
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(adItem.component);
        const componentRef = viewContainerRef.createComponent(componentFactory);
        const headerComponent = componentRef.instance as HeaderComponent;
        headerComponent.name = adItem.name;
        headerComponent.title = adItem.title;
        headerComponent.condition = adItem.condition;

        headerComponent.data = adItem.data;
        headerComponent.dataDefault = adItem.dataDefault;

        headerComponent.subject = adItem.subject;
        headerComponent.subject$ = adItem.subject$;

        headerComponent.automaticCloseOnClick = adItem.automaticCloseOnClick;

        this.subscription = headerComponent.subject$.subscribe((data) => {
          if (data && headerComponent.automaticCloseOnClick && this.componentInitialized) {
            this.onClick.emit(data);
          }
        });

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
}

