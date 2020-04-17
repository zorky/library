import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogData} from "../../confirmation-dialog/dialog-data.model";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, MatPaginatorIntl} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {concat, Observable, race} from 'rxjs';

import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
  filter,
  tap, concatMap
} from "rxjs/operators";
import {merge} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

import {ConfirmationDialogComponent} from "../../confirmation-dialog/confirmation-dialog.component";
import {Pagination} from "../../../services/base/pagination.model";
import {Author, AuthorService} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {AuthorContainerComponent} from "../author-container/author-container.component";
import {getAuthorFrenchPaginatorIntl} from "./paginator-authors.french";
import {ListParameters} from "../../../services/base/list-parameters.model";

/**
 * Liste des auteurs avec pagination, tris
 */
@Component({
  selector: 'app-authors-list',
  templateUrl: './authors-list.component.html',
  styleUrls: ['./authors-list.component.css'],
  providers: [{ provide: MatPaginatorIntl, useValue: getAuthorFrenchPaginatorIntl() }]
})
export class AuthorsListComponent implements OnDestroy, AfterViewInit {
  /* Datasource */
  authors: Author[] = [];
  /**
   * Champs à afficher
   */
  columns = ['auteur', 'books'];
  /**
   * Actions sur un auteur
   */
  actions = ['action_delete', 'action_update'];
  /**
   * L'ensemble des colonnes à afficher : champs + actions
   */
  displayedColumns = [...this.columns, ...this.actions];
  /**
   * Paramétres du paginator
   */
  total = 0;
  PAGE_SIZE = 5;
  /**
   * progress bar on / off
   */
  loading = false;
  /**
   * lien vers les composants tri et paginator
   */
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  /**
   * FormControl pour la recherche
   */
  search = new FormControl('');
  /**
   * Utilitaire subscribe / unsubscribe
   */
  subSink = new SubSink();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog, public snackBar: MatSnackBar,
              private authorSvc: AuthorService) { }
  ngAfterViewInit(): void {
    this._initDataTable();
  }

  /**
   * Livres de l'auteur
   * @param {Author} author : l'auteur
   */
  getBooks(author: Author) {
    return author?.books_obj?.reduce<string>((acc, currentValue, i) => {
      return i === 0 ? currentValue.name : `${acc}, ${currentValue.name}`;
    }, '');
  }
  /**
   * ACTIONS sur un auteur
   */
  /**
   * Ajout d'un auteur via une modale
   */
  addAuthor() {
    this._openAuthorModale();
  }
  /**
   * Edition d'un auteur via une modale
   * @param {Author} author
   */
  editAuthor(author: Author) {
    this._openAuthorModale(author);
  }
  /**
   * Suppression d'un auteur, après confirmation
   * @param {Author} author
   */
  deleteAuthor(author: Author) {
    const data = new DialogData();
    data.title = 'Auteur';
    data.message = `Souhaitez-vous supprimer cet auteur "${author.first_name} ${author.last_name}" ?`;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });
    dialogRef.updatePosition({top: '50px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authorSvc.delete(author).subscribe(() => {
          this.snackBar.open(`"${author.first_name} ${author.last_name}" bien supprimé`,
            'Auteur',
            {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
          this.paginator.pageIndex = 0;
          this._initDataTable();
        });
      }
    });
  }
  /**
   * Ouverture modale d'édition d'un auteur
   * @param {Author} author
   * @private
   */
  _openAuthorModale(author: Author = null) {
    const data = author;
    const dialogRef = this.dialog.open(AuthorContainerComponent, {data});
    dialogRef.updatePosition({top: '50px'});
    dialogRef.updateSize('600px');
    dialogRef.afterClosed().subscribe((result: Author) => {
      if (result) {
        this._initDataTable();
      }
    });
  }
  /**
   * Factorisation du switchMap
   * @private
   */
  _switchMap(): Observable<Pagination<Author>> {
    this._toggleLoading(true);
    const parameters: ListParameters = {
      limit: this.paginator.pageSize, offset: this.paginator.pageIndex * this.paginator.pageSize,
      sort: this.sort.active, order: this.sort.direction,
      keyword: this.search.value
    } as ListParameters;
    return this.authorSvc.fetchAll(parameters);
  }
  /**
   * Initialisation data table, écoutes sur le tri, la pagination et la recherche
   * @private
   */
  _initDataTable() {
    const search$ = this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(),
            switchMap((value) => {
              this.paginator.pageIndex = 0;
              return this._switchMap();
            }));
    const sortPaginate$ = merge(this.sort.sortChange, this.paginator.page)
      .pipe(startWith({}), switchMap((values) => this._switchMap()));

    this.subSink.sink = merge(search$, sortPaginate$)
      .subscribe((data: Pagination<Author>) => {
        this._toggleLoading(false);
        if (data) {
          this.total = data.total;
          this.authors = data.list;
        }
      });
  }
  _toggleLoading(value) {
    setTimeout(() => this.loading = value);
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
