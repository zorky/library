import {Component, OnDestroy, OnInit} from '@angular/core';
import {Author, AuthorService, Book} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogData} from "../../confirmation-dialog/dialog-data.model";
import {ConfirmationDialogComponent} from "../../confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-authors-list',
  templateUrl: './authors-list.component.html',
  styleUrls: ['./authors-list.component.css']
})
export class AuthorsListComponent implements OnInit, OnDestroy {
  dataSource: Author[] = [];
  columns = ['name', 'books'];
  actions = ['action_delete', 'action_update'];
  displayedColumns = [...this.columns, ...this.actions];
  loading = false;
  subSink = new SubSink();

  constructor(private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              private authorSvc: AuthorService) { }

  ngOnInit(): void {
    this.fetchAuthors();
  }
  fetchAuthors() {
    this.loading = true;
    this.subSink.sink = this.authorSvc
      .fetchAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe((authors) => {
        this.dataSource = authors;
      });
  }
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
          this.fetchAuthors();
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
