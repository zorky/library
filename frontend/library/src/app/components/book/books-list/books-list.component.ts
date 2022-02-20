import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';

import {SubSink} from '../../../services/subsink';
import {Book, BookService} from '../../../services';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {DialogData} from '../../confirmation-dialog/dialog-data.model';
import {Pagination} from '../../../services/base/pagination.model';
import {ListParameters} from '../../../services/base/list-parameters.model';
import {getBookFrenchPaginatorIntl} from './paginator-books.french';
import {UserGroupsService} from '../../../common/roles/user-groups.service';
import {UserGroups} from '../../../common/roles/usergroups.model';
import {roles} from '../../../common/roles/roles.enum';
import {AuthService} from '../../../services/authent/auth.service';
import {PubSubService} from '../../../services/pubsub/pub-sub.service';
import {LoanService} from '../../../services';
import {Loan} from '../../../services';

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
  connecte: UserGroups;
  rolesUser = roles;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog,
              private pubSubSvc: PubSubService,
              private authSvc: AuthService,
              public userGrpsSvc: UserGroupsService, // TODO voir Ngrx pour un accès global au connecté
              private bookSvc: BookService,
              private loanSvc: LoanService) { }

  ngOnInit(): void {
    this.subSink.sink = this.userGrpsSvc.connecte$.subscribe((connecte) => this.connecte = connecte);
    this.subSink.sink = this.bookSvc.loading$.subscribe((value) => {
      this.pubSubSvc.publish('loading', value);
      this.loading = value;
    });
    this._initPaginator();
    this.fetchBooks();
  }
  isLoaning(book: Book) {
    return book.borrowers.length > 0;
  }
  loanBook(book: Book) {
    const data = new DialogData();
    data.title = 'Livre';
    data.message = `Souhaitez-vous emprunter le livre "${book.name}" ?`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    this.subSink.sink = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const loan: Loan = {
          id: 0,
          user: this.connecte.id,
          book: book.id,
          in_progress: true,
          date_loan: new Date().toLocaleDateString(),
          date_return: null
        }
        this.subSink.sink = this.loanSvc
          .updateOrcreate(loan)
          .subscribe(_ => {
            this.snackBar.open(`"${book.name}" bien emprunté`,
              'Livre',
              {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
          });
        this.fetchBooks();
      }
    });
  }
  editBook(book: Book) {
    this.router.navigate(['/gestion/book/edit', {id: book.id}], {relativeTo: this.route.parent});
  }
  addBook() {
    this.router.navigate(['/gestion/book/edit', {id: 0}], {relativeTo: this.route.parent});
  }
  deleteBook(book: Book) {
    const data = new DialogData();
    data.title = 'Livre';
    data.message = `Souhaitez-vous supprimer ce livre "${book.name}" ?`;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       this.subSink.sink = this.bookSvc.delete(book).subscribe(() => {
         if (book) {
           this.snackBar.open(`"${book.name}" bien supprimé`,
             'Livre',
             {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
           this.fetchBooks();
         }
        });
      }
    });
  }
  fetchBooks() {
    this.books = [];
    const params = {
      limit: this.paginator.pageSize || this.PAGE_SIZE,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      extraParams: new Map<string, string>([['enabled', 'True']])
    } as ListParameters;
    this.subSink.sink = this.bookSvc
      .fetchAll(params)
      .subscribe((books: Pagination<Book>) => {
        this.total = books.total;
        this.books = books.list;
      });
  }
  isGest() {
    return this.authSvc.isAuthenticated() && this.connecte && this.userGrpsSvc.hasRole(this.connecte, roles.gestionnaire);
  }
  private _initPaginator() {
    this.subSink.sink = this.paginator.page
      .subscribe((page) => this.fetchBooks());
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
