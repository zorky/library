import {Type} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HeaderComponent} from '../../interfaces/component-header-interface.component';
import {ColumnComponent} from '../../interfaces/component-column-interface.component';

export class ComponentItem implements HeaderComponent{
  public dataDefault: any = null;
  public automaticCloseOnClick = false;
  public title = '';
  public condition = '';
  public subject$ = this.subject.asObservable();
  constructor(public component: Type<any>,
              public data: any,
              public name: string = '',
              public subject: BehaviorSubject<any> = new BehaviorSubject(null)) {}
}

export class ColumnComponentItem implements ColumnComponent {
  public name: string;
  public input: any;
  public column: string;
  public subject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public subject$ = this.subject.asObservable();
  constructor(public component: Type<ColumnComponent>, public data: any) {}
}
