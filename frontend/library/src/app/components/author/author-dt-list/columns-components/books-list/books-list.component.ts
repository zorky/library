import {AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject, forkJoin, from, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {distinct, isEmpty, takeUntil, toArray} from 'rxjs/operators';

import {ColumnComponent} from '../../../../../../../projects/data-table/src/lib/interfaces/component-column-interface.component';
import {SubSink} from '../../../../../services/subsink';
import {Author, Book} from '../../../../../services';
import {BookDtService} from '../../../../../services/books/book-dt.service';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListColumnComponent implements ColumnComponent, OnInit, OnDestroy {
  column: string;
  data: any;
  name: string;
  input: Author;
  subject: BehaviorSubject<any>;
  subject$: any;
  selectedValue = '';
  values: Book[] = [];
  subSink = new SubSink();
  books = new FormControl();
  selectedBooks: Book[];
  groupedBooks: Book[] = [];
  selectedEventsToEmit: Book[] = [];
  private unsubscribe$ = new Subject<void>();
  constructor(private fb: FormBuilder,
              private bookSvc: BookDtService) { }

  ngOnInit(): void {
    this._initData();
  }
  onSave() {
    const save$ = [];
    this.selectedBooks.forEach((book: Book) => {
      book.author = this.input.id;
      save$.push(this.bookSvc.updateOrcreate(book));
    });
    this.subSink.sink = forkJoin(save$).subscribe(() => this.subject.next(this.selectedBooks));
  }
  onSelectedBooks() {
    from(this.selectedBooks).pipe(
      isEmpty(),
      takeUntil(this.unsubscribe$)
    ).subscribe(val => {
      this.selectedEventsToEmit = (val) ? this.groupedBooks : this.selectedBooks;
    });
  }
  _getAllLabels() {
    from(this.values).pipe(
      distinct(e => e.name),
      toArray(),
      takeUntil(this.unsubscribe$)
    ).subscribe(e => {
      this.groupedBooks = e;
    });
  }
  private _initData() {
    this.selectedBooks = this.input.books_obj.map((_book: Book) => {
      return {id: _book.id, name: _book.name, nb_pages: _book.nb_pages, author: _book.author} as Book;
    });
    this.data.filterColumns.forEach((value, key) => {
      this.values.push({id: Number(key), name: value, enabled: true, nb_pages: 0, author: 0});
    });
    this._getAllLabels();
  }
  compareFn(book1: Book, book2: Book) {
    return book1 && book2 ? book1.id === book2.id : false;
  }
  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
