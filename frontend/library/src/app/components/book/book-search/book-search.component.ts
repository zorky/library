import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';

import {SubSink} from '../../../services/subsink';
import {Book, BookService} from '../../../services';
import {ListParameters} from '../../../services/base/list-parameters.model';

/**
 * Component de recherche de livres
 */
@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css']
})
export class BookSearchComponent implements OnInit {
  /**
   * Event à la sélection d'un livre à l'issue de la recherche
   */
  @Output() onBookSelected: EventEmitter<Book> = new EventEmitter<Book>();

  public loading = false;
  public search = new FormControl('');
  public booksSearch$: Observable<Book[]>;
  subSink = new SubSink();
  constructor(private bookSvc: BookService) { }

  ngOnInit(): void {
    this._initSearch();
  }
  onSelect(book: Book) {
    console.log(book);
    this.onBookSelected.emit(book);
    this._initSearch();
  }
  _initSearch() {
    this.booksSearch$ = this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(),
        switchMap((value) => {
          this.loading = true;
          const params = {keyword: value} as ListParameters;
          return this.bookSvc.fetchAll(params);
        }),
        map((books) => {
          this.loading = false;
          return books.list as Book[];
        }));
  }
}
