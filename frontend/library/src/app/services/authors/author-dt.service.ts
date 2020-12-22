import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {DaoGeneric} from '../../../../projects/data-table/src/lib/services/daoService';
import {environment} from '../../../environments/environment';
import {Author} from './author.model';

@Injectable({ providedIn: 'root' })
export class AuthorDtService extends DaoGeneric<Author> {
  private url =  `${environment.baseUrl}/library/authors/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
}
