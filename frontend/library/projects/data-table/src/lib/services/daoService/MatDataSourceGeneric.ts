import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {BehaviorSubject, merge, of, Subject} from 'rxjs';
import { Injectable } from '@angular/core';
import {startWith, catchError, switchMap, map, finalize} from 'rxjs/operators';
import { Pagination } from './pagination';
import { ListParameters } from './list-parameters';
import { DaoGeneric } from './generic.dao';

/**
 * DataSource générique data-table, appelle DaoGeneric<T>.listItems
 */
@Injectable({ providedIn: 'root' })
export class MatDataSourceGeneric<T> {
  private _datasource: MatTableDataSource<T> = new MatTableDataSource<T>();
  private _filterChange: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _sort: MatSort = null;
  private _paginator: MatPaginator = null;
  private _daoService: DaoGeneric<T>;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  /**
   * Savoir si la datasource est en train de charger la liste ou non
   */
  public loading$ = this.loadingSubject.asObservable();

  private listCountSubject = new Subject<number>();
  /**
   * Total de la pagination ramené (liste ramenée)
   * @type {Observable<number>}
   */
  public listCount$ = this.listCountSubject.asObservable();

  private listCountTotalSubject = new Subject<number>();
  /**
   * Total des éléments trouvès après filtre
   * @type {Observable<number>}
   */
  public listCountTotal$ = this.listCountTotalSubject.asObservable();

  private listDataSubject = new Subject<any[]>();
  /**
   * les éléménts paginés ramenés (list[])
   * @type {Observable<any[]>}
   */
  public listData$ = this.listDataSubject.asObservable();

  set filterValue(value: string) {
    this._filterChange.next(value);
  }

  get filterValue(): string {
    return this._filterChange.value;
  }

  set filterChange(value: BehaviorSubject<string>) {
    this._filterChange = value;
  }

  get filterChange(): BehaviorSubject<string> {
    return this._filterChange;
  }

  set sort(value: MatSort) {
    this._sort = value;
  }

  get sort(): MatSort {
    return this._sort;
  }

  set paginator(value: MatPaginator) {
    this._paginator = value;
  }

  get paginator(): MatPaginator {
    return this._paginator;
  }

  set datasource(value: MatTableDataSource<T>) {
    this._datasource = value;
  }

  get datasource(): MatTableDataSource<T> {
    return this._datasource;
  }

  /**
   * Injection du service à utiliser pour lister les objets (DaoGeneric<T>.list())
   * @param {DaoGeneric<T>} value
   */
  set daoService(value: DaoGeneric<T>) {
    this._daoService = value;
  }

  get daoService() {
    return this._daoService;
  }

  /**
   * Appel de DaoGeneric<T>.list(...), en interne : merge() sur sortChange / page / filterChange
   *
   * @param {Map<string, string>} extraParams : complément de paramètres pour la querystring
   * @param {Map<string, string[]>} extraDict : complément de paramètres pour la querystring, une même clé et plusieurs valeurs
   * @param {string} urlBaseOverride : url d'appel liste (get) à surcharger
   * @return {Observable<any>} : renvoie un Observable<Pagination> du merge()
   */
  list(extraParams: Map<string, string> = null,
       extraDict: Map<string, string[]> = null,
       urlBaseOverride: string = null) {
    this.loadingSubject.next(true);
    const $merge = merge(this.sort.sortChange, this.paginator.page, this.filterChange);
    return $merge
      .pipe(
        startWith({}),
        switchMap(() => {
          const search = this.filterValue || '';

          const parameters: ListParameters = {
            limit: this.paginator.pageSize,
            offset: (this.paginator.pageIndex) * (this.paginator.pageSize),

            sort: this.sort.active,
            order: this.sort.direction,

            keyword: search,

            extraParams,
            extraDict,

            urlBaseOverride
          };
          return this._daoService.listItems(parameters);
        }),
        map((data: Pagination) => {
          this.listCountTotalSubject.next(data.total);
          this.listCountSubject.next(data.list.length);
          this.listDataSubject.next(data.list);
          this.loadingSubject.next(false);

          return data;
        }),
        finalize(() => this.loadingSubject.next(false)),
        catchError(() => {
          return of([]);
        }));
  }
}
