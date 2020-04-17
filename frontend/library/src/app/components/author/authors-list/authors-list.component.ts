import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogData} from "../../confirmation-dialog/dialog-data.model";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, MatPaginatorIntl} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

import {catchError, debounceTime, distinctUntilChanged, finalize, map, startWith, switchMap, filter} from "rxjs/operators";
import {BehaviorSubject, fromEvent, merge, of} from 'rxjs';

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
  /**
   * Datasource
   */
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
   * Recherche d'auteurs, déclenchement au bout de 2 caractères
   */
  private minFilter = 2;
  /**
   * Subject interne, pour lancer la recherche via api.search() à l'issue du fromEvent
   */
  private filterChange: BehaviorSubject<string> = new BehaviorSubject<string>('');
  /**
   * champ / input de recherche
   */
  @ViewChild('filter') filter: ElementRef;
  /**
   * lien vers les composants tri et paginator
   */
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  /**
   * Utilitaire subscribe / unsubscribe
   */
  subSink = new SubSink();

  constructor(private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog, public snackBar: MatSnackBar,
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
   * Alernatives pour l'ajout / édition via des routes vers une vue
   */
  /* addAuthor() {
    this.router.navigate(['/author/edit', {id: 0}], {relativeTo: this.route.parent});
  } */
  /* editAuthor(author: Author) {
    this.router.navigate(['/author/edit', {id: author.id}], {relativeTo: this.route.parent});
  } */
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
   * Init filtre recherche
   * Se déclenche au bout de 400 ms
   * sur une chaîne différente que la précédente
   * sur une chaîne > minFilter
   * sur une chaîne non vide
   * @private
   */
  _initFilter() {
    this.subSink.sink = fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(debounceTime(400), distinctUntilChanged(),
            filter(() => this.filter.nativeElement.value.length >= this.minFilter ||
                                 this.filter.nativeElement.value.length === 0))
      .subscribe(() => {
        const filterValue = this.filter?.nativeElement?.value?.trim().toLowerCase();
        this.paginator.pageIndex = 0;
        this.filterChange.next(filterValue);
      });
  }
  /**
   * Initialisation data table, écoutes sur le tri, la pagination et la recherche
   * @private
   */
  _initDataTable() {
    this._initFilter();
    this.subSink.sink = merge(this.sort.sortChange, this.paginator.page, this.filterChange)
      .pipe(startWith({}),
            switchMap(() => {
              this._toggleLoading(true);
              const parameters: ListParameters = {
                limit: this.paginator.pageSize, offset: this.paginator.pageIndex * this.paginator.pageSize,
                sort: this.sort.active, order: this.sort.direction,
                keyword: this.filterChange.value
              } as ListParameters;
              return this.authorSvc.fetchAll(parameters);
        }),
        map(data => {
          this._toggleLoading(false);
          return data;
        }),
        finalize(() => this._toggleLoading(false)),
        catchError(() => {
          this._toggleLoading(false);
          return of(null);
        })
      ).subscribe((data: Pagination<Author>) => {
        this.total = data.total;
        this.authors = data.list;
      });
  }
  _toggleLoading(value) {
    setTimeout(() => this.loading = value);
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
