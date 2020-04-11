import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Author, AuthorService} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogData} from "../../confirmation-dialog/dialog-data.model";
import {ConfirmationDialogComponent} from "../../confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, finalize, map, startWith, switchMap} from "rxjs/operators";
import {merge, of} from 'rxjs';
import {MatSort} from "@angular/material/sort";
import {Pagination} from "../../../services/base/pagination.model";
import {MatPaginator} from "@angular/material/paginator";

/**
 * Liste des auteurs avec pagination, tris
 */
@Component({
  selector: 'app-authors-list',
  templateUrl: './authors-list.component.html',
  styleUrls: ['./authors-list.component.css']
})
export class AuthorsListComponent implements OnInit, OnDestroy {
  authors: Author[] = [];
  columns = ['last_name', 'books'];
  actions = ['action_delete', 'action_update'];
  displayedColumns = [...this.columns, ...this.actions];
  loading = false;
  total = 0;
  PAGE_SIZE = 5;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  subSink = new SubSink();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private changeDetectorRefs: ChangeDetectorRef,
              public dialog: MatDialog, public snackBar: MatSnackBar,
              private authorSvc: AuthorService) { }

  ngOnInit(): void {
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
  addAuthor() {
    this.router.navigate(['/author/edit', {id: 0}], {relativeTo: this.route.parent});
  }
  editAuthor(author: Author) {
    this.router.navigate(['/author/edit', {id: author.id}], {relativeTo: this.route.parent});
  }
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
          this._initDataTable();
        });
      }
    });
  }
  _toggleLoading(value) {
    setTimeout(() => this.loading = value);
  }
  _initDataTable() {
    this.subSink.sink = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this._toggleLoading(true);
          return this.authorSvc
            .fetchAll(this.paginator.pageSize,
              this.paginator.pageIndex * this.paginator.pageSize,
                    this.sort.active, this.sort.direction);
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
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
