import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {AsyncSubject, BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, finalize, map, publishReplay, refCount} from 'rxjs/operators';
import {SortDirection} from '@angular/material/sort';
import {Pagination} from './pagination.model';
import {TemplatePaginationDjango} from './pagination-django.model';
import {ListParameters} from './list-parameters.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Injectable, Injector} from '@angular/core';
import {AppInjector} from '../../common/injector';

/**
 * ServiceGeneric : fourniture du CRUD sur un type T
 */
@Injectable({ providedIn: 'root' })
export abstract class ServiceGeneric<T> {
  /**
   * Cache d'éléments pour le fetchAll()
   * @type {Pagination<T>}
   */
  protected cacheItems: AsyncSubject<Pagination<T>>;
  protected data: Observable<Pagination<T>>;
  private snackBar: MatSnackBar;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  protected constructor(private http: HttpClient) {
    this.snackBar = AppInjector.getInjector().get(MatSnackBar);
  }

  /**
   * Pour obtenir l'url "root" de l'API souhaitée
   * Exemple : `${environment.baseUrl}/plateform/books/`;
   */
  abstract getRootUrl(urlApp?: string): string;

  /**
   * Obtient la liste des entités T
   * @param listParameters
   */
  public fetchAll(listParameters?: ListParameters): Observable<Pagination<T>> {
    return this._fetchAll(listParameters?.limit, listParameters?.offset,
      listParameters?.sort, listParameters?.order,
      listParameters?.keyword, listParameters?.extraParams,
      listParameters?.withCache);
  }

  /**
   * suppression cache explicite
   */
  clearCache() {
    this.data = null;
    this.cacheItems = null;
  }

  /**
   * Obtient une entité T
   * @param id : l'id recherché
   */
  public fetch(id) {
    this.loadingSubject.next(true);
    const urlId = this._getUrl(id);
    return this.http
      .get<T>(urlId)
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error) => this._catchError(error)));
  }

  /**
   * Création d'une entité de type T, en POST
   * @param object : l'objet à créer
   */
  public create(object: T) {
    this.loadingSubject.next(true);
    const url = this._getUrl();
    return this.http
      .post(url, JSON.stringify(object),{headers: this._setHeadersJson()})
      .pipe(finalize(() => {
          this.clearCache();
          this.loadingSubject.next(false);
          }),
            catchError((error) => this._catchError(error)));
  }

  /**
   * Mise à jour d'une entité de type T, en PUT
   * @param object : l'objet à modifier
   * @param key permet (optionnel) de préciser la prioprité clé de l'objet à modifier, par défaut 'id'
   */
  public update(object: T, key: string = 'id') {
    this.loadingSubject.next(true);
    const url = this._getUrl(object[key]);
    return this.http
      .put(url, object)
      .pipe(finalize(() => {
          this.clearCache();
          this.loadingSubject.next(false);
        }),
        catchError((error) => this._catchError(error)));
  }

  /**
   * update ou create selon l'id d'une entité (0 ou > 0)
   * @param object
   * @param key
   */
  public updateOrcreate(object, key: string = 'id'): Observable<any> {
    return (key in object && object[key]) ? this.update(object, key) : this.create(object);
  }

  /**
   * Patch d'une propriété d'une entité
   * @param object l'objet à "patcher"
   * @param key permet (optionnel) de préciser la prioprité clé de l'objet à modifier, par défaut 'id'
   */
  public patch(object: T, key: string = 'id') {
    this.loadingSubject.next(true);
    const url = this._getUrl(object[key]);
    return this.http
      .patch<T>(url, object)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
          this.clearCache();
        }),
        catchError((error) => this._catchError(error)));
  }

  /**
   * Suppression d'une entité
   * @param object : l'objet à supprimer
   * @param key la propriété clé de l'objet à supprimer, par défaut 'id'
   */
  public delete(object: T, key: string = 'id') {
    return this._delete(object[key]);
  }

  /**
   * Suppresion d'une entité par son id
   * @param id id de l'entité à supprimer
   */
  public deleteById(id) {
    return this._delete(id);
  }
  /***
   * PROTECTED
   ****/
  /**
   * Obtient la liste des entités T
   *
   * @param {number} limit : le nombre maximim d'enregistrements
   * @param {number} offset : à partir de quel enregistrement
   * @param {string} sort : champ de tri
   * @param {SortDirection} order : asc ou desc
   * @param {string} keyword : chaine de recherche
   * @param {Map<string, string>} extraParams : compléments de paramètres
   * @param {boolean} withCache : utilisation du cache ou non
   */
  protected _fetchAll(limit?: number, offset?: number,
                      sort?: string, order?: SortDirection,
                      keyword?: string,
                      extraParams?: Map<string, string>,
                      withCache?: boolean): Observable<Pagination<T>> {
    this.loadingSubject.next(true);
    let params = this._getPaginationAndSearchAndExtraParams(limit, offset, keyword, extraParams);
    if (sort && sort !== '') {
      params = this._getSorting(sort, order, params);
    }
    const url = this._getUrl();
    if (!withCache) {
      this.data = this.cacheItems = null;
      return this.http
        .get(url, {params})
        .pipe(
          finalize(() => this.loadingSubject.next(false)),
          map(response => this._getPagination(response, limit),
          catchError((error) => of(this._catchError(error)))));
    } else {
      return this._getCacheItemsMethod1(url, limit, params)
        .pipe(
          finalize(() => this.loadingSubject.next(false)),
          catchError((error) => of(this._catchError(error))));
    }
  }

  /**
   * Détermine l'URL de l'API à utiliser, avec ou sans id
   * @param id
   * @protected
   */
  protected _getUrl(id = null) {
    let url = this.getRootUrl();
    if (id !== null) {
      url = `${url}${id}/`;
    }
    return url;
  }
  /**
   * Création des HttpParams à partir du Map<>
   *
   * @param {Map<string, string>} extraParams
   * @return {HttpParams}
   * @protected
   */
  protected _getUrlHttpExtraParams(extraParams: Map<string, string>): HttpParams {
    let urlQS = new HttpParams();
    if (extraParams !== null) {
      extraParams.forEach((v, k) => {
        urlQS = urlQS.set(k, v);
      });
    }
    return urlQS;
  }
  /**
   * Obtention des paramètres de pagination pour la construction de la querystring API
   *
   * @param {number} limit : nb. max d'objets / d'enregistrements à ramener [optionnel, si limit > 0]
   * @param {number} offset : à partir de quel enregistrement [optionnel, selon limit]
   * @param {string} keyword : texte de recherche [optionnel]
   * @param {Map<string, any>} extraParams : complément de paramètres à envoyer [optionnel]
   * @return {HttpParams}
   * @protected
   */
  protected _getPaginationAndSearchAndExtraParams(limit: number, offset: number,
                                                  keyword: string = null,
                                                  extraParams: Map<string, any> = null): HttpParams {
    let params: HttpParams = this._getUrlHttpExtraParams(extraParams);
    if (limit) {
      params = params.set('limit', limit.toString()).set('offset', offset.toString());
    }
    if (keyword && keyword !== '') {
      params = params.set('search', keyword);
    }
    return params;
  }
  /**
   * Enrichissement des HttpParams pour le sorting
   *
   * @param {string} sort : champ de tri
   * @param {SortDirection} order : ordre de tri : 'asc' | 'desc'
   * @param {HttpParams} params : params à compléter
   * @return {HttpParams}
   * @protected
   */
  protected _getSorting(sort: string, order: SortDirection, params: HttpParams): HttpParams {
    let orderDirection = '';
    let orderField = '';
    if (order) {
      switch (order) {
        case 'asc':
          orderDirection = '';
          break;
        case 'desc':
          orderDirection = '-';
          break;
      }
    }
    if (sort) {
      orderField = `${orderDirection}${sort}`;
      params = params.set('ordering', orderField);
    }

    return params;
  }
  /**
   * Création de l'object Pagination : .list, .total, .totalView
   * A partir de la pagination Django
   * @param {Object} response : retour JSON de type TemplateObject { count: n, results: [{}] }
   * @param {number} limit : limite de la liste d'objets ramenés, si limit null | 0 : la pagination Django n'est pas activée
   * @return {Pagination}
   * @protected
   */
  protected _getPagination(response, limit: number): Pagination<T> {
    const pagination: Pagination<T> = new Pagination<T>();
    if ('results' in response && limit > 0) {
      const list = response as TemplatePaginationDjango<T>;
      pagination.total = list.count;
      pagination.list = list.results;
      pagination.totalView = pagination.list.length;
    } else {
      const list = response as T[];
      pagination.total = list.length;
      pagination.list = list;
      pagination.totalView = list.length;
    }
    return pagination;
  }

  /****
   * PRIVATE
   ****/

  /**
   * Gestion du cache pour les éléments de la pagination
   * via publishReplay / refCount
   * @param url
   * @param limit
   * @param params
   * @private
   */
  private _getCacheItemsMethod1(url: string, limit: number, params: HttpParams) {
    if (!this.data) {
      this.cacheItems = new AsyncSubject();
      this.data = this.http
        .get<T[]>(url, {params})
        .pipe(map(response => {
            return this._getPagination(response, limit);
          }),
          publishReplay(1),
          refCount());
    }
    return this.data;
  }
  /**
   * Gestion du cache pour les éléments de la pagination
   * via AsyncSubject
   * @param url
   * @param limit
   * @param params
   * @private
   */
  private _getCacheItemsMethod2(url: string, limit: number, params: HttpParams) {
    if (! this.cacheItems) {
      this.cacheItems = new AsyncSubject();
      return this.http
        .get<T[]>(url, {params})
        .pipe(map(response => {
            const page = this._getPagination(response, limit);
            this.cacheItems.next(page);
            this.cacheItems.complete();
            return page;
          }));
    }
    return this.cacheItems;
  }
  /**
   * Factorisation delete / deleteById
   * @param id
   * @private
   */
  private _delete(id) {
    this.loadingSubject.next(true);
    const url = this._getUrl(id);
    return this.http.delete(url)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
          this.clearCache();
        }),
        catchError((error) => this._catchError(error)));
  }

  /**
   * Postionnement entête content-type en application/json
   * pour le POST
   * @private
   */
  private _setHeadersJson(): HttpHeaders {
    const headers = new HttpHeaders();
    return headers.append('content-type', 'application/json');
  }
  private _catchError(error: HttpErrorResponse) {
    console.log(error);
    let message = error?.message || 'une erreur est survenue';
    switch (error.status) {
      case 401:
        message = 'Accès non autorisé, veuillez vous connecter';
        break;
      case 403:
        message = 'Accès interdit, vous n\'avez pas les droits suffisants';
        break;
    }
    this.snackBar.open(`${message}`,
      'ERREUR',
      {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
    this.loadingSubject.next(false);
    return null;
  }
}
