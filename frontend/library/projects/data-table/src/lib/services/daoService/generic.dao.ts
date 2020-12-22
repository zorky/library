import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, finalize, map} from 'rxjs/operators';
import {AsyncSubject, BehaviorSubject, Observable, throwError} from 'rxjs';

import { ListParameters } from './list-parameters';
import {Pagination} from './pagination';
import {TemplateObject} from './interfaces-http';


/**
 * DaoGeneric : fourniture d'un CRUD sur un type T
 *
 * Utile pour le MatDataSource sur le list()
 */
export abstract class DaoGeneric<T> {
  /** Caching items for list */
  // private allItems: Cacheable<Pagination> = new Cacheable<Pagination>();
  protected _cacheItems: AsyncSubject<Pagination>;
  /** loading indicateur */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  constructor(private http: HttpClient) {
  }

  /**
   * Pour obtenir l'url "root" de l'API souhaitée
   *
   * Exemple : `${environment.baseUrl}/projets/categories/`;
   * @return {string}
   */
  abstract getRootUrl(urlApp?: string): string;

  /**
   * Obtient la liste d'objects T sous forme de Pagination
   *
   * @param {string} sort : champ de tri [optionnel]
   * @param {string} order : si 'sort', ordre du tri : asc | desc [optionnel]
   * @param {number} limit : nb. max d'éléments à ramener
   * @param {number} offset : démarre la pagination à partir de 'offset'
   * @param {Map<string, string>} extraParams : extra paramètres à passer à la requête API [optionnel]
   * @param {string} keyword : mot de recherche le cas échéant (!= '') [optionnel]
   * @param {Map<string, string[]>} extraDict : extra paramètres où la clé à plusieurs valeurs : key=val1&key=val2&...&key=valn
   * @param {string} urlBaseOverride : url à surcharger (remplacerra getRootUrl())
   * @param {boolean} withCache : accède au cache ou non
   * @return {Observable<Pagination>} : un objet Pagination des éléments trouvés
   */
  list(sort: string, order: string, limit: number, offset: number,
       extraParams: Map<string, string> = null,
       keyword = '',
       extraDict: Map<string, string[]> = null,
       urlBaseOverride: string = null,
       withCache = false): Observable<Pagination> {
    this.loadingSubject.next(true);
    let params1 = this._getPaginationParams(limit, offset, keyword, extraParams);

    let url = '';
    if (urlBaseOverride) {
      url = urlBaseOverride;
    } else {
      url = this.getRootUrl();
    }

    if (sort && sort !== '') {
      params1 = this._getSorting(sort, order, params1);
    }

    const params = this._getUrlHttpDict(extraDict, params1);

    if (! withCache) {
      return this.http
        .get<T[]>(url, {params})
        .pipe(
          finalize(() => this.loadingSubject.next(false)),
          map(response => this._getPagination(response, limit)));
    } else {
      if (! this._cacheItems) {
        this._cacheItems = new AsyncSubject();
        return this.http
          .get<T[]>(url, {params})
          .pipe(
            finalize(() => this.loadingSubject.next(false)),
            map(response => {
              this._cacheItems.next(this._getPagination(response, limit));
              this._cacheItems.complete();
              return this._getPagination(response, limit);
        }));
      } else {
        return this._cacheItems;
      }
    }
  }

  /**
   * Obtient la liste d'objects T sous forme de Pagination
   *
   * @param {ListParameters} parameters : paramètre pour l'obtention de la liste (sorting, pagination, mot de recherche, extra paramètres)
   * @return {Observable<Pagination>}
   */
  listItems(parameters: ListParameters): Observable<Pagination> {
    return this.list(
      parameters.sort, parameters.order,
      parameters.limit, parameters.offset,
      parameters.extraParams,
      parameters.keyword,
      parameters.extraDict,
      parameters.urlBaseOverride,
      parameters.withCache);
  }

  /**
   * Liste de tous les éléments
   *
   * @param {Map<string, string>} extraParams : extra params url [optionnel]
   * @param {string} keyword : mot de recherche [optionnel]
   * @param {boolean} withCache : activer le cache ? [optionnel]
   * @return {Observable<Pagination>}
   */
  listAllItems(extraParams: Map<string, string> = null, keyword: string = '', withCache?: boolean): Observable<Pagination> {
    return this.list('', '', 0, 0, extraParams, keyword, null, null, withCache);
  }

  /**
   * Obtient un objet (GET)
   * @param id l'id de l'objet à obtenir
   * @param stripEnd
   * @return {Observable<any>}
   */
  public get(id, stripEnd = false): Observable<any> {
    this.loadingSubject.next(true);
    const url = this._getUrl(id, stripEnd);
    return this.http
      .get(url)
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * Création d'un objet (POST)
   * @param object
   * @param extraParams paramètres à ajouter en querystring
   * @return {Observable<any>}
   */
  public create(object, extraParams: Map<string, string> = null): Observable<any> {
    this.loadingSubject.next(true);
    const url = this._getUrl();
    const params = this._getUrlHttpParams(extraParams);
    return this.http.post(url, JSON.stringify(object), {params})
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * Màj d'un objet (PUT)
   *
   * @param object doit contenir la propriété 'key'
   * @param key clé de recherche de l'objet, par défaut 'id'
   * @return {Observable<any>}
   */
  public update(object, key = 'id'): Observable<any> {
    this.loadingSubject.next(true);
    const url = this._getUrl(object[key]);
    return this.http
      .put(url, object)
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * update ou create selon l'id (0 ou > 0)
   * @param object
   * @param key
   */
  public updateOrcreate(object, key = 'id'): Observable<any> {
    return (key in object && object[key]) ? this.update(object, key) : this.create(object);
  }

  /**
   * Suppression d'un objet par son id
   * @param id
   * @param extraParams
   * @private
   */
  private _delete(id, extraParams: Map<string, string> = null) {
    this.loadingSubject.next(true);
    const url = this._getUrl(id);
    const params = this._getUrlHttpParams(extraParams);
    return this.http
      .delete(url, {params})
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * Suppression d'un objet
   * @param object doit contenir la propriété 'key'
   * @param {string} key clé de recherche de l'object, par défaut 'id'
   * @param {Map<string, string>} extraParams : paramètres à ajouter en querystring
   * @returns {Observable<any>}
   */
  public delete(object, key = 'id', extraParams: Map<string, string> = null): Observable<any> {
    return this._delete(object[key], extraParams);
    //
    // const url = this._getUrl(object[key]);
    // const params = this._getUrlHttpParams(extraParams);
    //
    // return this.http.delete(url, {params: params}).pipe(catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * Suppression d'un objet par son id
   * @param id : l'id de l'objet à supprimer
   * @param {Map<string, string>} extraParams : paramètres à ajouter en querystring
   */
  public deleteById(id, extraParams: Map<string, string> = null): Observable<any>  {
    return this._delete(id, extraParams);
  }

  /**
   * Patch de propriétés d'un objet
   * @param object doit contenir la propriété 'key'
   * @param key clé de recherche de l'objet, par défaut 'id'
   * @return {Observable<T>}
   */
  public patch(object, key = 'id'): Observable<T> {
    this.loadingSubject.next(true);
    const url = this._getUrl(object[key]);
    return this.http
      .patch<T>(url, object)
      .pipe(
        finalize(() => this.loadingSubject.next(false)),
        catchError((error: any) => this._throwObservable(error)));
  }

  /**
   * Recherche sur une valeur en GET
   * @param {string} keyword valeur de recherche
   * @param {Map<string, string>} extraParams : filtres supplémentaires à la recherche
   * @return Observable<T[]>
   */
  public search(keyword: string, extraParams: Map<string, string> = null): Observable<T[]> {
    // const urlQS = this._getSearchParams(keyword);
    const urlQS = this._getPaginationParams(0, 0, keyword, extraParams);

    return this.http.get<T[]>(this.getRootUrl(), { params: urlQS });
  }

  /***************************
   * PROTECTED METHODS
   */

  /**
   * Création de l'object Pagination : .list, .total, .totalView
   *
   * @param response : retour JSON de type TemplateObject { count: n, results: [{}] }
   * @param limit : limite de la liste d'objets ramenés, si limit null | 0 : la pagination Django n'est pas activée
   * @return {Pagination}
   * @private
   */
  protected _getPagination(response, limit) {
    const pagination: Pagination = new Pagination();

    if ('results' in response && limit > 0) {
      const list = response as TemplateObject;
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

  /**
   * paramètre de recherche
   * @param keyword
   * @return {HttpParams}
   * @private
   */
  protected _getSearchParams(keyword) {
    let urlQS = new HttpParams();
    urlQS = urlQS.set('search', keyword);

    return urlQS;
  }

  /**
   * Obtention des paramètres de pagination pour la construction de la querystring API
   *
   * @param {number} limit : nb. max d'objets / d'enregistrements à ramener [optionnel, si limit > 0]
   * @param {number} offset : à partir de quel enregistrement [optionnel, selon limit]
   * @param {string} keyword : text de recherche [optionnel]
   * @param {Map<string, any>} extraQS
   * @return {HttpParams}
   * @private
   */
  protected _getPaginationParams(limit: number, offset: number, keyword: string, extraQS: Map<string, any> = null) {
    let params: HttpParams = this._getUrlHttpParams(extraQS);
    if (limit > 0) {
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
   * @param {string} order : ordre de tri : asc | desc
   * @param {HttpParams} params
   * @return {HttpParams}
   * @private
   */
  protected _getSorting(sort: string, order: string, params: HttpParams) {
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

  /******************************
   * PRIVATE METHODS
   *
   *******************************/

  /**
   * Obtient l'URL
   * @param {any} id [optionnel] id nécessaire pour le get/update/remove
   * @param stripEnd
   * @return {string}
   */
  protected _getUrl(id = null, stripEnd = false) {
    let url = this.getRootUrl();

    if (id !== null) {
      if (stripEnd) {
        url = `${url}${id}`;
      } else {
        url = `${url}${id}/`;
      }
    }

    return url;
  }

  /**
   * Création des HttpParams à partir du Map<string, string[]>
   * @param {Map<string, string[]>} extraQS
   * @param {Map<string, string[]>} urlQS
   * @return {HttpParams}
   * @private
   */
  protected _getUrlHttpDict(extraQS: Map<string, string[]>, urlQS: HttpParams): HttpParams {
    // let urlQS = new HttpParams();

    if (extraQS !== null) {
      extraQS.forEach((v: string[], k) => {
        v.forEach(value => {
          urlQS = urlQS.append(k, value);
        });
      });
    }

    return urlQS;
  }

  /**
   * Création des HttpParams à partir du Map<>
   * @param {Map<string, string>} extraQS
   * @return {HttpParams}
   * @private
   */
  protected _getUrlHttpParams(extraQS: Map<string, string>): HttpParams {
    let urlQS = new HttpParams();

    if (extraQS !== null) {
      extraQS.forEach((v, k) => {
        urlQS = urlQS.set(k, v);
      });
    }

    return urlQS;
  }

  protected _throwObservable(error: any) {
    return throwError(error.error || `Server error : ${error} ${JSON.stringify(error)}`);
    // return Observable.throwError(error.error || `Server error : ${error} ${JSON.stringify(error)}`);
  }
}
