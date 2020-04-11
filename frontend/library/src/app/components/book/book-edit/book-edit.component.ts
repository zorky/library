import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {from, Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, finalize} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {SubSink} from '../../../services/subsink';
import {Author, AuthorService, Book, BookService} from '../../../services';
import {AuthorContainerComponent} from '../../author/author-container/author-container.component';
import {Pagination} from "../../../services/base/pagination.model";

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.css']
})
export class BookEditComponent implements OnInit {
  bookForm: FormGroup;
  maxName = 100;
  /*
    Observable liste des auteurs pour le select
   */
  authors$: Observable<Pagination<Author>>;
  isUpdateMode = false;
  loading = false;
  disabled = false;
  formDirty = false;
  subSink = new SubSink();

  constructor(private router: Router, private route: ActivatedRoute,
              private fb: FormBuilder, private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private authorSvc: AuthorService,
              private bookSvc: BookService) {
  }

  ngOnInit(): void {
    this._initAuthors();
    this._initBookIfUpdate();
  }

  save() {
    this.disabled = this.loading = true;
    this.bookSvc
      .updateOrcreate(this.bookForm.value)
      .pipe(finalize(() => this.disabled = this.loading = false))
      .subscribe((book: Book) => {
        this.snackBar.
          open(`"${book.name}" bien ${this.isUpdateMode ? 'mis à jour' : 'ajouté'}`,
          'Livre',
          {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
        this._initForm(book);
    });
  }
  addAuthor() {
    const dialogRef = this.dialog.open(AuthorContainerComponent, {});
    dialogRef.updatePosition({top: '50px'});
    dialogRef.updateSize('600px');
    dialogRef.afterClosed().subscribe((result: Author) => {
      if (result) {
        console.log(result);
        this._initAuthors();
        this.bookForm.patchValue({author: result.id});
      }
    });
  }
  goList() {
    this.router.navigate(['/books']);
  }
  getLabelCancelOrReturn() {
    if (this.formDirty) {
      return 'Abandonner et retourner sur la liste';
    }
    return 'Retourner sur la liste';
  }

  private _initBookIfUpdate() {
    const id = this.route.snapshot.params['id'];
    if (id && id !== '0') {
      this.loading = true;
      this.subSink.sink = this.bookSvc
        .fetch(id)
        .pipe(finalize(() => this.loading = false))
        .subscribe((book: Book) => {
          this._initForm(book);
        });
    } else {
      this._initForm();
    }
  }

  private _initAuthors() {
    this.authors$ = this.authorSvc.fetchAll();
  }

  private _initForm(book: Book = null) {
    this.isUpdateMode = book && book.id > 0;
    this.bookForm = this.fb.group({
      id: [book ? book.id : 0],
      name: [book?.name, [Validators.required, Validators.maxLength(this.maxName)]],
      author: [book?.author, Validators.required],
      nb_pages: [book?.nb_pages, Validators.required],
      enabled: [book ? book.enabled : true]
    });
    this.subSink.sink = this.bookForm.valueChanges.subscribe(values =>  {
      this.formDirty = true;
    });
  }
}
