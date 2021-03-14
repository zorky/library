import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {AuthorDtService} from '../../../services/authors/author-dt.service';
import {Author, Book} from '../../../services';
import {roles} from '../../../common/roles/roles.enum';
import {AuthService} from '../../../services/authent/auth.service';
import {UserGroupsService} from '../../../common/roles/user-groups.service';
import {UserGroups} from '../../../common/roles/usergroups.model';
import {SubSink} from '../../../services/subsink';
import {DialogData} from '../../confirmation-dialog/dialog-data.model';
import {ConfirmationDialogComponent} from '../../confirmation-dialog/confirmation-dialog.component';
import {AuthorContainerComponent} from '../../../gestion/author/author-container/author-container.component';
import {AuthorFilterDtComponent} from './filters/author-filter-dt/author-filter-dt.component';
import {BookDtService} from '../../../services/books/book-dt.service';
import {BooksFilterDtComponent} from './filters/books-filter-dt/books-filter-dt.component';
import {BooksListColumnComponent} from './columns-components/books-list/books-list.component';
import {
  ActionDataTable,
  ColumnDataTable,
  DataTableComponent,
  DataTableHeaderColumnComponentService,
  HeaderFilterOptions,
  MatDataSourceGeneric,
  Pagination
} from 'data-table';

@Component({
  selector: 'app-author-dt-list',
  templateUrl: './author-dt-list.component.html',
  styleUrls: ['./author-dt-list.component.css']
})
export class AuthorDtListComponent implements OnInit {
  columns: ColumnDataTable[] = [{
    column: 'author', header: 'Auteur', sortField: 'last_name',
    display: (element: Author) => `${element.first_name} ${element.last_name}`,
    tooltip: (row: Author) => `${row.first_name} ${row.last_name}`,
    headerFilterToolTip: (row) => 'Filtrer sur l\'auteur',
    headerFilterOptions: {colorIcon: 'warn', hasBackDrop: true, position: 'right'} as HeaderFilterOptions,
    flex: 20,
    sort: true
  },
    {
      column: 'books', header: 'Livres',
      display: (element: Author) => this.getBooks(element),
      tooltip: (row: Author) => this.getBooks(row),
      headerFilterToolTip: (row) => 'Filtrer sur un livre',
      sort: false
    }];
  actions: ActionDataTable[] = [];
  dsAuthors: MatDataSourceGeneric<Author> = new MatDataSourceGeneric<Author>();
  /**
   * Paramétres de filtrage sur l'API DaoService.listItems(params)
   */
  extraParams: Map<string, string> = new Map<string, string>();
  /**
   * les valeurs possibles pour les listes des filtres colonnes : id / chaîne à afficher
   */
  filterColumns: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
  @ViewChild(DataTableComponent, {static: false}) matDataTable: DataTableComponent;
  /**
   * Connecté et ses groupes
   */
  connecte: UserGroups;
  rolesUser = roles;
  subSink = new SubSink();
  constructor(private authSvc: AuthService,
              private dialog: MatDialog,
              public snackBar: MatSnackBar,
              public userGrpsSvc: UserGroupsService,
              private dataTableHeaderSvc: DataTableHeaderColumnComponentService,
              private bookSvc: BookDtService,
              private authorSvc: AuthorDtService) {
    this.dsAuthors.daoService = authorSvc;
  }

  ngOnInit(): void {
    this._setActions();
    this._setFilterAuthor();
    this._setFilterBook();
  }
  getBooks(author: Author) {
    return author?.books_obj?.reduce<string>((acc, currentValue, i) => {
      return i === 0 ? currentValue.name : `${acc}, ${currentValue.name}`;
    }, '');
  }
  addAuthor() {
    this._openAuthorModale();
  }
  editAuthor(author: Author) {
    this._openAuthorModale(author);
  }
  deleteAuthor(author: Author) {
    const data = new DialogData();
    data.title = 'Auteur';
    data.message = `Souhaitez-vous supprimer cet auteur "${author.first_name} ${author.last_name}" ?`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    this.subSink.sink = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subSink.sink = this.authorSvc.delete(author).subscribe(() => {
          this.snackBar.open(`"${author.first_name} ${author.last_name}" bien supprimé`,
            'Auteur', {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
          this.matDataTable.reload();
        });
      }
    });
  }
  isGest() {
    return this.authSvc.isAuthenticated() &&
      this.connecte &&
      this.userGrpsSvc.hasRole(this.connecte, roles.gestionnaire);
  }

  /**
   * Initialisation du filtre colonne sur les livres
   */
  _setFilterBook() {
    this.subSink.sink = this.bookSvc
      .listAllItems()
      .subscribe((books: Pagination) => {
        const listBooks = new Map<string, string>();
        (books.list as Book[])
          .forEach((book) => listBooks.set(book.id.toString(), `${book.name}`));
        this.filterColumns.set('books', listBooks);
        this._setBookFilter('books', 'sur un livre', 'book',
          'Filtrer par un livre', 'Livre', () => this.matDataTable.reload());
        this._setAuthorDynamicComponent('books', 'auteur', 'book');
      });
  }

  /**
   * Initialisation du filtre colonne sur les auteurs
   */
  _setFilterAuthor() {
    this.subSink.sink = this.authorSvc
      .listAllItems()
      .subscribe((authors: Pagination) => {
        const listAuthors = new Map<string, string>();
        (authors.list as Author[])
          .forEach((author) => listAuthors.set(author.id.toString(), `${author.first_name} ${author.last_name}`));
        this.filterColumns.set('author', listAuthors);
        this._setAuthorFilter('author', 'sur un auteur', 'id',
          'Filtrer par un auteur', 'Auteur', () => this.matDataTable.reload());
      });
  }
  _setActions() {
    this.subSink.sink = this.userGrpsSvc.connecte$.subscribe((connecte) => {
      if (this.userGrpsSvc.hasRole(connecte, roles.gestionnaire)) {
        this.actions = [{
          label: 'delete', tooltip: 'Supprimer l\'auteur',  icon: 'delete',
          click: (row: Author) => this.deleteAuthor(row),
          iconcolor: 'warn',
        },
          {
            label: 'edit', tooltip: 'Modifier l\'auteur',  icon: 'edit',
            click: (row: Author) => this.editAuthor(row),
            iconcolor: 'accent',
          }];
      }
      this.connecte = connecte;
    });
  }
  /**
   * Ouverture modale d'édition d'un auteur
   * @param {Author} author
   * @private
   */
  private _openAuthorModale(author: Author = null) {
    const data = author;
    const dialogRef = this.dialog.open(AuthorContainerComponent, {data});
    dialogRef.updatePosition({top: '50px'});
    dialogRef.updateSize('600px');
    this.subSink.sink = dialogRef.afterClosed().subscribe((result: Author) => {
      if (result) {
        this.matDataTable.reload();
      }
    });
  }

  /**
   * Initialisation du composant sur la cellule livre : livres à choisir pour l'auteur de la ligne
   * @param listName
   * @param listLabel
   * @param keyFilter
   * @param callBack
   * @private
   */
  private _setAuthorDynamicComponent(listName, listLabel, keyFilter,
                                     callBack: () => void = null) {
    const data = {
      filterColumns: this._getValuesMap(listName),
    };
    const filterComponent = this.dataTableHeaderSvc
      .createColumnComponent(
        this.columns, listName, `books_list_${listName}`, `${listLabel}`,
        BooksListColumnComponent, data);
    if (filterComponent) {
      filterComponent.subject$.subscribe((_data) => {
        this.matDataTable.reload();
      });
    }
  }
  /**
   * Création du component colonne filtre Author
   * @param listName
   * @param listLabel
   * @param keyFilter
   * @param placeHolder
   * @param condName
   * @param callBack
   * @private
   */
  private _setAuthorFilter(listName, listLabel, keyFilter, placeHolder, condName,
                           callBack: () => void = null) {
    const data = {
      placeHolder, keyFilter,
      filterColumns: this._getValuesMap(listName),
      filterName: condName
    };
    const filterComponent = this.dataTableHeaderSvc.createHeaderComponent(
      this.columns, listName, `author_filter_list_${listName}`, `${listLabel}`,
      AuthorFilterDtComponent, data, true);

    if (filterComponent) {
      this.subSink.sink = filterComponent.subject$.subscribe((d) => {
        if (d && d.key) {
          filterComponent.dataDefault = {id: d.value};

          if (this.extraParams.get(d.key)) {
            this.extraParams.delete(d.key);
          }
          if (d.value === 0 || d.value === '0') {
            this.extraParams.delete(d.key);
          } else {
            this.extraParams.set(d.key, d.value);
          }
          if (callBack) {
            callBack.call(null, null);
          }
        }
      });
    }
  }
  private _setBookFilter(listName, listLabel, keyFilter, placeHolder, condName,
                         callBack: () => void = null) {
    const data = {
      placeHolder, keyFilter,
      filterColumns: this._getValuesMap(listName),
      filterName: condName
    };
    const filterComponent = this.dataTableHeaderSvc.createHeaderComponent(
      this.columns, listName, `book_filter_list_${listName}`, `${listLabel}`,
      BooksFilterDtComponent, data, true);

    if (filterComponent) {
      this.subSink.sink = filterComponent.subject$.subscribe((d) => {
        if (d && d.key) {
          filterComponent.dataDefault = {id: d.value};
          if (this.extraParams.get(d.key)) {
            this.extraParams.delete(d.key);
          }
          if (d.value === 0 || d.value === '0') {
            this.extraParams.delete(d.key);
          } else {
            this.extraParams.set(d.key, d.value);
          }
          if (callBack) {
            callBack.call(null, null);
          }
        }
      });
    }
  }

  /**
   * Obtention d'un dico key / value à partir de filterColumns: Map<string, Map<string, string>>
   * @param {string} key : sur cette clé
   */
  private _getValuesMap(key: string): Map<string, string> {
    if (this.filterColumns.has(key)) {
      return this.filterColumns.get(key);
    }
    return new Map<string, string>();
  }
}
