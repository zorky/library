import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {SubSink} from '../../../services/subsink';
import {Book, BookService} from '../../../services';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {DialogData} from '../../confirmation-dialog/dialog-data.model';
import {Pagination} from "../../../services/base/pagination.model";

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit, OnDestroy {
  subSink = new SubSink();
  books: Book[];
  loading = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog,
              private bookSvc: BookService) { }

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks() {
    this.loading = true;
    this.books = [];
    this.subSink.sink = this.bookSvc
      .fetchAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe((books: Pagination<Book>) => {
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
          this.fetchBooks();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
