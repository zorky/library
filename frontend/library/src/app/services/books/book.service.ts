import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Book} from './book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private url =  `${environment.baseUrl}/library/books/`;
  constructor(private httpClient: HttpClient) { }

  /**
   * Liste de tous les livres
   */
  public fetchAll() {
    return this.httpClient.get<Book[]>(this.url);
  }

  /**
   * Obtient un livre particulier par son id
   * @param {number} id : l'identifiant du livre
   */
  public fetch(id: number) {
    const urlId = `${this.url}${id}/`;
    return this.httpClient.get<Book>(urlId);
  }
}
