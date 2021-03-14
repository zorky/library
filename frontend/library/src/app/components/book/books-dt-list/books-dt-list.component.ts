import {Component, OnInit, ViewChild} from '@angular/core';
import {Author, Book} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {BookDtService} from '../../../services/books/book-dt.service';
import {AuthorSelectComponent} from './columns-components/author-select/author-select.component';
import {AuthorDtService} from '../../../services/authors/author-dt.service';
import {BookEnabledComponent} from './columns-components/book-enabled/book-enabled.component';
import {BookNameComponent} from './columns-components/book-name/book-name.component';
import {DialogData} from '../../confirmation-dialog/dialog-data.model';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {roles} from '../../../common/roles/roles.enum';
import {AuthService} from '../../../services/authent/auth.service';
import {UserGroupsService} from '../../../common/roles/user-groups.service';
import {UserGroups} from '../../../common/roles/usergroups.model';
import {
  ActionDataTable,
  ColumnDataTable,
  DataTableComponent,
  DataTableHeaderColumnComponentService,
  MatDataSourceGeneric, Pagination
} from 'data-table';

@Component({
  selector: 'app-books-dt-list',
  templateUrl: './books-dt-list.component.html',
  styleUrls: ['./books-dt-list.component.css']
})
export class BooksDtListComponent implements OnInit {
  columns: ColumnDataTable[] = [{
    column: 'name', header: 'Livre', sortField: 'name',
    sticky: true,
    display: (element: Book) => {
      return `${element.name}`;
    },
    flex: 25,
    sort: true
  },
    {
    column: 'author', header: 'Auteur', sortField: 'author__last_name',
    display: (element: Book) => {
      return `${element.author_obj.first_name} ${element.author_obj.last_name}`;
    },
    sort: true
  },
    {
      column: 'enabled', header: 'Disponible ?',
      display: (element: Book) => {
        return element.enabled;
      },
      sort: true
    }];
  actions: ActionDataTable[] = [{
    label: 'delete', tooltip: 'Supprimer le livre',  icon: 'delete',
    click: (row: Book) => this.deleteBook(row),
    iconcolor: 'warn',
  },
    {
      label: 'edit', tooltip: 'Modifier le livre',  icon: 'edit',
      click: (row: Book) => this.editBook(row),
      iconcolor: 'accent',
    }];
  dsBooks: MatDataSourceGeneric<Book> = new MatDataSourceGeneric<Book>();
  extraParams: Map<string, string> = new Map<string, string>();
  filterColumns: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
  @ViewChild(DataTableComponent, {static: false}) matDataTable: DataTableComponent;
  connecte: UserGroups;
  loading = false;
  subSink = new SubSink();
  constructor(private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private dataTableHeaderSvc: DataTableHeaderColumnComponentService,
              private authSvc: AuthService,
              public userGrpsSvc: UserGroupsService,
              private authorSvc: AuthorDtService,
              private bookSvc: BookDtService) {
    this.dsBooks.daoService = bookSvc;
  }

  ngOnInit(): void {
    this.subSink.sink = this.userGrpsSvc.connecte$.subscribe((connecte) => this.connecte = connecte);
    this.subSink.sink = this.bookSvc.loading$.subscribe((enabled) => this.loading = enabled);
    this._setCellName();
    this._setCellAuthor();
    this._setCellEnabled();
  }
  _setCellName() {
    const filterComponent = this.dataTableHeaderSvc
      .createColumnComponent(
        this.columns, 'name', `book_name`, `titre du livre`,
        BookNameComponent, null);
  }
  _setCellEnabled() {
    const filterComponent = this.dataTableHeaderSvc
      .createColumnComponent(
        this.columns, 'enabled', `book_enabled`, `livre disponible`,
        BookEnabledComponent, null);
  }
  _setCellAuthor() {
    this.subSink.sink = this.authorSvc
      .listAllItems()
      .subscribe((authors: Pagination) => {
        const listAuthors = new Map<string, string>();
        (authors.list as Author[])
          .forEach((author) => listAuthors.set(author.id.toString(), `${author.first_name} ${author.last_name}`));
        this.filterColumns.set('author', listAuthors);
        this._setAuthorDynamicComponent('author', 'sur un auteur', 'author');
      });
  }
  addBook() {
    this.router.navigate(['/gestion/book/edit', {id: 0}], {relativeTo: this.route.parent});
  }
  editBook(book: Book) {
    this.router.navigate(['/gestion/book/edit', {id: book.id}], {relativeTo: this.route.parent});
  }
  isGest() {
    return this.authSvc.isAuthenticated() && this.connecte && this.userGrpsSvc.hasRole(this.connecte, roles.gestionnaire);
  }
  private deleteBook(book: Book) {
    const data = new DialogData();
    data.title = 'Livre';
    data.message = `Souhaitez-vous supprimer ce livre "${book.name}" ?`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    this.subSink.sink = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subSink.sink = this.bookSvc.delete(book).subscribe(() => {
          if (book) {
            this.snackBar.open(`"${book.name}" bien supprimé`, 'Livre',
              {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
            this.matDataTable.reload();
          }
        });
      }
    });
  }
  private _columnSetValues(key): Map<string, string> {
    if (this.filterColumns.has(key)) {
      return this.filterColumns.get(key);
    }
    return new Map<string, string>();
  }
  private _setAuthorDynamicComponent(listName, listLabel, keyFilter,
                                     callBack: () => void = null) {
    const data = {
      filterColumns: this._columnSetValues(listName),
    };
    const filterComponent = this.dataTableHeaderSvc
      .createColumnComponent(
        this.columns, listName, `authors_list_${listName}`, `${listLabel}`,
        AuthorSelectComponent, data);
  }
}
