import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, noop, Subscription} from 'rxjs';
import {SubSink} from '../../../../../services/subsink';
import {DataTableHeaderCommunicationService, HeaderComponent} from 'data-table';

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

  subSink = new SubSink();
  subAllReinit = new SubSink();
  subReinit = new SubSink();

  constructor(public dtCommunicationSvc: DataTableHeaderCommunicationService) {
  }

  ngOnInit(): void {
    this._initData();
    this._initReinit();
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

  /**
   * Effet de bord : multi fois, filtre sur auteur : puis supprimer le filtre, pas mal d'appels (annulés)
   * accumulation des subs, pas de possibilité de unscribe sinon l'emit ne peut plus être capturé ci-après
   * @private
   */
  private _initReinit() {
    /* attention ne pas faire de unsubscribe dans le destory sinon le sub ne marchera plus */
    this.subAllReinit.sink = this.dtCommunicationSvc.sendAllFiltersReinit$.subscribe((yes) => {
      yes ? this.sendRenit() : noop();
    });
    this.subReinit.sink = this.dtCommunicationSvc.sendFilterReinit$.subscribe((name) => {
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
    this.subReinit.unsubscribe();
    this.subAllReinit.unsubscribe();
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
    /* this.subAllReinit.unsubscribe();
    this.subReinit.unsubscribe(); */
  }

  // filterUsed(name: string, value: any, user: boolean): void {}

}
