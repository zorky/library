import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ServiceGeneric} from '../base/service-generic.service';
import {Author} from './author.model';
import {Pagination} from "../base/pagination.model";
import {of} from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthorService extends ServiceGeneric<Author> {
  private url =  `${environment.baseUrl}/library/authors/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }

  /* protected _getPagination(response, limit: number): Pagination<Author> {
    const page = new Pagination<Author>();
    page.total = 1;
    page.totalView = 1;
    page.list = [{id: 1, first_name: 'Super', last_name: 'Dudu'}];
    return page;
  } */
}
