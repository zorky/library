import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ServiceGeneric} from '../base/service-generic.service';
import {Book} from './book.model';

@Injectable({ providedIn: 'root' })
export class BookService extends ServiceGeneric<Book> {
  private url =  `${environment.baseUrl}/library/books/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
}
