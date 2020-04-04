import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

import {SubSink} from '../../../services/subsink';
import {Author, AuthorService, Book, BookService} from '../../../services';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.css']
})
export class BookEditComponent implements OnInit {
  bookForm: FormGroup;
  maxName = 100;
  authors$: Observable<Author[]>;
  isUpdateMode = false;
  loading = false;
  subSink = new SubSink();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private authorSvc: AuthorService,
              private bookSvc: BookService) {
  }

  ngOnInit(): void {
    this._initAuthors();
    this._initBookIfUpdate();
  }

  save() {
    this.bookSvc.updateOrcreate(this.bookForm.value).subscribe((data) => {
      console.log(data);
    });
  }

  private _initBookIfUpdate() {
    const id = this.route.snapshot.params['id'];
    if (id && id !== '0') {
      this.loading = true;
      this.subSink.sink = this.bookSvc
        .fetch(id)
        .pipe(finalize(() => this.loading = false))
        .subscribe((book: Book) => {
          this.isUpdateMode = true;
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
    this.bookForm = this.fb.group({
      id: [book ? book.id : 0],
      name: [book?.name, [Validators.required, Validators.maxLength(this.maxName)]],
      author: [book?.author, Validators.required],
      nb_pages: [book?.nb_pages, Validators.required],
      enabled: [book ? book.enabled : true]
    });
  }

  // private _initForm(book: Book = null) {
  //   this.bookForm = new FormGroup({
  //     id:  new FormControl([book ? book.id : 0]),
  //     name: new FormControl([book?.name, [Validators.required, Validators.maxLength(this.maxName)]]),
  //     author: new FormControl([book?.author, Validators.required]),
  //     nb_pages: new FormControl([book?.nb_pages, Validators.required]),
  //     enabled: new FormControl([book ? book.enabled : true])
  //   });
  // }
}
