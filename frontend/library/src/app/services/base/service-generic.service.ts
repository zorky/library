import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from "rxjs/operators";
import {Sort, SortDirection} from "@angular/material/sort";
import {Pagination} from "./pagination.model";
import {TemplatePaginationDjango} from "./pagination-django.model";

/**
 * ServiceGeneric : fourniture d'un CRUD sur un type T
 */
export abstract class ServiceGeneric<T> {
  protected constructor(private http: HttpClient) {
  }

  /**
   * Pour obtenir l'url "root" de l'API souhaitée
   * Exemple : `${environment.baseUrl}/plateform/books/`;
   */
  abstract getRootUrl(urlApp?: string): string;
  /**
   * Obtient la liste des entités T
   *
   * @param {number} limit : le nombre maximim d'enregistrements
   * @param {number} offset : à partir de quel enregistrement
   * @param {string} sort : champ de tri
   * @param {SortDirection} order : asc ou desc
   * @param {string} keyword : chaine de recherche
   * @param {Map<string, string>} extraParams : compléments de paramètres
   */
  public fetchAll(limit: number = null, offset: number = null,
                  sort: string = null, order: SortDirection = null,
                  keyword: string = null,
                  extraParams: Map<string, string> = null) {
    let params = this._getPaginationAndSearchAndExtraParams(limit, offset, keyword, extraParams);
    if (sort && sort !== '') {
      params = this._getSorting(sort, order, params);
    }
    const url = this._getUrl();
    return this.http
      .get(url, {params})
      .pipe(map(response => this._getPagination(response, limit)));
  }

  /**
   * Obtient une entité T
   * @param id : l'id recherché
   */
  public fetch(id) {
    const urlId = this._getUrl(id);
    return this.http.get<T>(urlId);
  }

  /**
   * Création d'une entité de type T, en POST
   * @param object : l'objet à créer
   */
  public create(object: T) {
    const url = this._getUrl();
    return this.http.post(url, JSON.stringify(object), {headers: this._setHeadersJson()});
  }

  /**
   * Mise à jour d'une entité de type T, en PUT
   * @param object : l'objet à modifier
   * @param key permet (optionnel) de préciser la prioprité clé de l'objet à modifier, par défaut 'id'
   */
  public update(object: T, key: string = 'id') {
    const url = this._getUrl(object[key]);
    return this.http.put(url, object);
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
  public patch(object: T, key: string = 'id'): Observable<T> {
    const url = this._getUrl(object[key]);
    return this.http.patch<T>(url, object);
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
  protected _getSorting(sort: string, order: SortDirection, params: HttpParams) {
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
   * Factorisation delete / deleteById
   * @param id
   * @private
   */
  private _delete(id) {
    const url = this._getUrl(id);
    return this.http.delete(url);
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
}
