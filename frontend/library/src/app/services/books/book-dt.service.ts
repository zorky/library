import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Book} from '..';
import {DaoGeneric} from 'data-table';

@Injectable({ providedIn: 'root' })
export class BookDtService extends DaoGeneric<Book> {
  private url =  `${environment.baseUrl}/library/books/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
}
