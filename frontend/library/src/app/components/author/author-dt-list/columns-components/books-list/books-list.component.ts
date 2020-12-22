import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, forkJoin, from, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {distinct, finalize, isEmpty, takeUntil, toArray} from 'rxjs/operators';
import {SubSink} from '../../../../../services/subsink';
import {Author, Book} from '../../../../../services';
import {BookDtService} from '../../../../../services/books/book-dt.service';
import {ToastyService} from '../../../../../services/toasty/toasty.service';
import {EnsemblesService} from '../../../../../services/ensembles.service';
import {ColumnComponent} from 'data-table';

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
  inputBooks: Book[] = [];
  selectedBooks: Book[];
  groupedBooks: Book[] = [];
  selectedEventsToEmit: Book[] = [];
  loading = false;
  private unsubscribe$ = new Subject<void>();
  constructor(private fb: FormBuilder,
              private toastySvc: ToastyService,
              private compareSvc: EnsemblesService,
              private bookSvc: BookDtService) { }

  ngOnInit(): void {
    this._initData();
  }
  _displayInOutBook() {
    const interect = this.compareSvc.intersect<Book>(this.inputBooks, this.selectedBooks);
    const notInInput = this.compareSvc.notInList1<Book>(this.inputBooks, this.selectedBooks);
    const notInSelect = this.compareSvc.notInList2<Book>(this.inputBooks, this.selectedBooks);

    console.log('intersection ', interect);
    console.log('notInInput ', notInInput);
    console.log('notInSelect ', notInSelect);
  }
  private _detectAddedDeletedBooks() {
    const added$ = [];
    const deleted$ = [];
    const notInInput = this.compareSvc.notInList1<Book>(this.inputBooks, this.selectedBooks);
    const notInSelect = this.compareSvc.notInList2<Book>(this.inputBooks, this.selectedBooks);
    notInSelect.forEach((book: Book) => {
      book.author = null;
      deleted$.push(this.bookSvc.patch(book));
    });
    notInInput.forEach((book: Book) => {
      book.author = this.input.id;
      added$.push(this.bookSvc.patch(book));
    });
    return [...deleted$, ...added$];
  }
  onSave() {
    this.loading = true;
    const addOrdelete$ = this._detectAddedDeletedBooks();
    this.subSink.sink = forkJoin(addOrdelete$)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => {
        this.toastySvc.toasty(
          `Les livres ont bien été mis à jour`,
          `Auteur ${this.input.first_name} ${this.input.last_name}`);
        this.subject.next(this.selectedBooks); });
  }
  isSaveDisabled() {
    const notInInput = this.compareSvc.notInList1<Book>(this.inputBooks, this.selectedBooks);
    const notInSelect = this.compareSvc.notInList2<Book>(this.inputBooks, this.selectedBooks);
    if (notInInput.length === 0 && notInSelect.length === 0) {
      return true;
    }
    return !this.selectedBooks || this.selectedBooks.length <= 0;
  }
  onSelectedBooks(event) {
    this._displayInOutBook();
    from(this.selectedBooks).pipe(
      isEmpty(),
      takeUntil(this.unsubscribe$)
    ).subscribe(val => {
      this.selectedEventsToEmit = (val) ? this.groupedBooks : this.selectedBooks;
    });
  }
  _setBooksToSelect() {
    from(this.values).pipe(
      distinct(e => e.name),
      toArray(),
      takeUntil(this.unsubscribe$)
    ).subscribe(e => {
      this.groupedBooks = e;
    });
  }
  private _initData() {
    this.inputBooks = this.input.books_obj.map((book: Book) => {
      return {id: book.id, name: book.name, nb_pages: book.nb_pages, enabled: true, author: 0} as Book;
    });
    this.selectedBooks = this.input.books_obj.map((book: Book) => {
      return {id: book.id, name: book.name, nb_pages: book.nb_pages, enabled: true, author: 0} as Book;
    });
    this.data.filterColumns.forEach((value, key) => {
      this.values.push({id: Number(key), name: value, nb_pages: 0, enabled: true, author: 0});
    });
    this._setBooksToSelect();
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
