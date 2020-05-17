import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, noop} from 'rxjs';

import {HeaderComponent} from '../../../../../../../projects/data-table/src/lib/interfaces/component-header-interface.component';
import {DataTableHeaderCommunicationService} from '../../../../../../../projects/data-table/src/lib/services/data-table-communication.service';

@Component({
  selector: 'app-author-filter-dt',
  templateUrl: './author-filter-dt.component.html',
  styleUrls: ['./author-filter-dt.component.css']
})
export class AuthorFilterDtComponent implements HeaderComponent, OnInit, OnDestroy {
  /**
   * HeaderComponent implémentation
   */
  data: any;
  dataDefault: any;
  name: string;
  subject: BehaviorSubject<any>;
  subject$: any;

  selectedValue = '';
  values: any[] = [];

  constructor(public dtCommunicationSvc: DataTableHeaderCommunicationService) { }

  ngOnInit(): void {
    this.data.filterColumns.forEach((value, key) => {
      this.values.push({id: key, label: value});
    });

    if (this.dataDefault) {
      const selectObj = this.values.find((v) => v.id == this.dataDefault.id);
      if (selectObj) {
        this.selectedValue = selectObj;
      }
    }

    /* attention ne pas faire de unsubscribe dans le destory sinon le sub ne marchera plus */
    this.dtCommunicationSvc.sendAllFiltersReinit$.subscribe((yes) => {
      yes ? this.sendRenit() : noop();
    });

    this.dtCommunicationSvc.sendFilterReinit$.subscribe((name) => {
      this.name === name ? this.sendRenit() : noop();
    });
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
  }
  ngOnDestroy(): void {
  }

}
