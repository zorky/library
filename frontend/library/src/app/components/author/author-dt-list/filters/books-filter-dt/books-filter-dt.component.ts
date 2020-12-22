import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, noop} from 'rxjs';
import {SubSink} from '../../../../../services/subsink';
import {DataTableHeaderCommunicationService, HeaderComponent} from 'data-table';

@Component({
  selector: 'app-books-filter-dt',
  templateUrl: './books-filter-dt.component.html',
  styleUrls: ['./books-filter-dt.component.css']
})
export class BooksFilterDtComponent implements HeaderComponent, OnInit {
  data: any;
  dataDefault: any;
  name: string;
  subject: BehaviorSubject<any>;
  subject$: any;

  selectedValue = '';
  values: any[] = [];

  subSink = new SubSink();
  subAllReinit = new SubSink();
  subReinit = new SubSink();

  constructor(public dtCommunicationSvc: DataTableHeaderCommunicationService) { }

  ngOnInit(): void {
    this._initData();
    this._initReinit();
  }
  onFilterSelect(selectValue) {
    this.dtCommunicationSvc.filterUsed(this.name, selectValue.value.id, selectValue.value.id !== 0);
    const dataEmit = {
      value: selectValue.value.id,
      key: this.data.keyFilter,
      condition: `${this.data.filterName} = '${selectValue.value.label}'`
    };
    this.subject.next(dataEmit);
    this.dtCommunicationSvc.filterUsed(this.name, dataEmit);
  }
  sendRenit() {
    const dataEmit = {value: 0, key: this.data.keyFilter};
    this.subject.next(dataEmit);
    this.dtCommunicationSvc.filterUsed(this.name, dataEmit, false);
    this.subReinit.unsubscribe();
    this.subAllReinit.unsubscribe();
  }
  private _initData() {
    this.data.filterColumns.forEach((value, key) => {
      this.values.push({id: key, label: value});
    });

    if (this.dataDefault) {
      const selectObj = this.values.find((v) => v.id === this.dataDefault.id);
      if (selectObj) {
        this.selectedValue = selectObj;
      }
    }
  }
  private _initReinit() {
    /* attention ne pas faire de unsubscribe dans le destory sinon le sub ne marchera plus */
    this.subAllReinit.sink = this.dtCommunicationSvc.sendAllFiltersReinit$.subscribe((yes) => {
      yes ? this.sendRenit() : noop();
    });
    this.subReinit.sink = this.dtCommunicationSvc.sendFilterReinit$.subscribe((name) => {
      this.name === name ? this.sendRenit() : noop();
    });
  }

}
