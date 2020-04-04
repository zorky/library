import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

/**
 * ServiceGeneric : fourniture d'un CRUD sur un type T
 */
export abstract class ServiceGeneric<T> {
  protected constructor(private http: HttpClient) {
  }
  /**
   * Postionnement entête content-type en application/json
   * @private
   */
  static _setHeadersJson(): HttpHeaders {
    const headers = new HttpHeaders();
    return headers.append('content-type', 'application/json');
  }
  /**
   * Pour obtenir l'url "root" de l'API souhaitée
   * Exemple : `${environment.baseUrl}/plateform/books/`;
   */
  abstract getRootUrl(urlApp?: string): string;
  /**
   * Obtient la liste des entités T
   */
  public fetchAll() {
    const url = this._getUrl();
    return this.http.get<T[]>(url);
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
    return this.http.post(url, JSON.stringify(object), {headers: ServiceGeneric._setHeadersJson()});
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
}
