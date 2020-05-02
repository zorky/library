import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';

import {SubSink} from '../../../services/subsink';
import {Author, Book, BookService} from '../../../services';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {DialogData} from '../../confirmation-dialog/dialog-data.model';
import {Pagination} from '../../../services/base/pagination.model';
import {ListParameters} from '../../../services/base/list-parameters.model';
import {getBookFrenchPaginatorIntl} from './paginator-books.french';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css'],
  providers: [{ provide: MatPaginatorIntl, useValue: getBookFrenchPaginatorIntl() }]
})
export class BooksListComponent implements OnInit, OnDestroy {
  subSink = new SubSink();
  books: Book[];
  loading = false;
  PAGE_SIZE = 5;
  total = 0;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog,
              private bookSvc: BookService) { }

  ngOnInit(): void {
    this._initPaginator();
    this._fetchBooks();
  }

  _fetchBooks() {
    this.loading = true;
    this.books = [];
    const params = {
      limit: this.paginator.pageSize,
      offset: this.paginator.pageIndex * this.paginator.pageSize
    } as ListParameters;
    this.subSink.sink = this.bookSvc
      .fetchAll(params)
      .pipe(finalize(() => this.loading = false))
      .subscribe((books: Pagination<Book>) => {
        this.total = books.total;
        this.books = books.list;
      });
  }

  editBook(book: Book) {
    this.router.navigate(['/book/edit', {id: book.id}], {relativeTo: this.route.parent});
  }
  addBook() {
    this.router.navigate(['/book/edit', {id: 0}], {relativeTo: this.route.parent});
  }
  deleteBook(book: Book) {
    const data = new DialogData();
    data.title = 'Livre';
    data.message = `Souhaitez-vous supprimer ce livre "${book.name}" ?`;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookSvc.delete(book).subscribe(() => {
          this.snackBar.open(`"${book.name}" bien supprimé`,
            'Livre',
            {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
          this._fetchBooks();
        });
      }
    });
  }
  private _initPaginator() {
    this.subSink.sink = this.paginator.page
      .subscribe((page) => this._fetchBooks());
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
