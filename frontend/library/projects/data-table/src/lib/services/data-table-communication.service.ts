import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

/**
 * Pour la communication entre data-table.component et les headers components
 * - pour la réinit de tous les filtres (parent => children)
 * - pour la réinit d'un filtre
 * - pour l'état d'un filtre (child => parent)
 */
@Injectable({ providedIn: 'root' })
export class DataTableHeaderCommunicationService {
  private reinitAllFiltersSource = new Subject<boolean>();
  private reinitFilterSource = new Subject<string>();
  private filterUsedSource = new Subject<{name: string, value: any, used: boolean}>();

  sendAllFiltersReinit$ = this.reinitAllFiltersSource.asObservable();
  sendFilterReinit$ = this.reinitFilterSource.asObservable();
  filterUsed$ = this.filterUsedSource.asObservable();

  sendReinitAllFilters(value: boolean) {
    this.reinitAllFiltersSource.next(value);
    // this.reinitAllFiltersSource.unsubscribe();
    // this.reinitAllFiltersSource.complete();
  }

  sendReinitFilter(value: string) {
    // return Observable.create(observer => {
    //   this.sendFilterReinit$.subscribe(() => {
    //     observer.next(value);
    //     observer.complete();
    //   });
    // });

    this.reinitFilterSource.next(value);
    // this.reinitFilterSource.complete();
    // this.reinitFilterSource.unsubscribe();
  }

  filterUsedSub() {
    // TODO à tester pour remplacer le Observable.create()
    return new Observable(observer => {
       this.filterUsed$.subscribe((value) => {
         observer.next(value);
         observer.complete();
       });
    });
    /* return Observable.create(observer => {
      this.filterUsed$.subscribe((value) => {
        console.log('filterUsedSub ', value);
        observer.next(value);
        observer.complete();
      });
    }); */
  }

  /**
   * Précise quel filtre est en cours d'utilisation
   * @param {string} name : nom du component
   * @param {any} value : value
   * @param {boolean} used : utilisé ? par défaut true
   */
  filterUsed(name: string, value: any, used: boolean = true) {
    this.filterUsedSource.next({name, value, used});
  }
}
