import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {DaoGeneric} from '../../../../projects/data-table/src/lib/services/daoService';
import {environment} from '../../../environments/environment';
import {Book} from '..';

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
