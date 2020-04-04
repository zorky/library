import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ServiceGeneric} from '../base/service-generic.service';
import {Author} from './author.model';

@Injectable({ providedIn: 'root' })
export class AuthorService extends ServiceGeneric<Author> {
  private url =  `${environment.baseUrl}/library/authors/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
}
