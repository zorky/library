import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ServiceGeneric} from '../base/service-generic.service';
import {Book} from './book.model';
import {Observable} from 'rxjs';
import {upload, Upload} from 'ngx-operators';

@Injectable({ providedIn: 'root' })
export class BookService extends ServiceGeneric<Book> {
  private url =  `${environment.baseUrl}/library/books/`;

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  getRootUrl(urlApp?: string): string {
    return this.url;
  }
  public upLoadPicture(book: Book, file: File) {
    let upload$: Observable<Upload>;
    if (!file || !book) {
      return new Observable<Upload>(observer => {
        observer.next({progress: 100, state: 'DONE'} as Upload);
        observer.complete();
      });
    }
    const data = new FormData();
    data.append('picture', file);
    upload$ = this.httpClient
      .patch(`${this.url}${book.id}/`, data, {
        reportProgress: true,
        observe: 'events'
      }).pipe(upload());
    return upload$;
  }
}
