import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';
import {Author, AuthorService, Book} from '../../../services';
import {SubSink} from '../../../services/subsink';

@Component({
  selector: 'app-author-edit',
  templateUrl: './author-edit.component.html',
  styleUrls: ['./author-edit.component.css']
})
export class AuthorEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() author: Author;
  @Input() onReturn = 'list';
  @Output() authorUpdated = new EventEmitter<Author>();

  authorForm: FormGroup;
  maxInput = 25;
  loading = false;
  isUpdateMode = false;
  disabled = false;
  formDirty = false;
  subSink = new SubSink();

  constructor(private router: Router, private route: ActivatedRoute,
              private fb: FormBuilder, public snackBar: MatSnackBar,
              private authorSvc: AuthorService) {
  }

  ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

  ngOnInit(): void {
    this._initAuthorIfUpdate();
  }

  save() {
    this.disabled = this.loading = true;
    this.authorSvc
      .updateOrcreate(this.authorForm.value)
      .pipe(finalize(() => this.disabled = this.loading = false))
      .subscribe((author: Author) => {
        this.snackBar.
        open(`"${author.first_name} ${author.last_name}" bien ${this.isUpdateMode ? 'mis à jour' : 'ajouté'}`,
          'Auteur',
          {duration: 2000, verticalPosition: 'top', horizontalPosition: 'end'});
        this._initForm(author);
        console.log(author);
        this.authorUpdated.emit(author);
      });
  }
  goList() {
    this.authorUpdated.emit(null);
    if (this.onReturn === 'list') {
      this.router.navigate(['/authors']);
    }
  }
  getLabelCancelOrReturn() {
    if (this.formDirty) {
      return 'Abandonner';
    }
    return 'Retourner';
  }

  /**
   * PRIVATE
   *
   **/

  private _initForm(author: Author = null) {
    this.isUpdateMode = author && author.id > 0;
    this.authorForm = this.fb.group({
      id: [author ? author.id : 0],
      first_name: [author?.first_name, Validators.required],
      last_name: [author?.last_name, Validators.required]
    });
    this.subSink.sink = this.authorForm.valueChanges.subscribe(values => {
      this.formDirty = true;
    });
  }
  private _fetchAuthor(id) {
    this.loading = true;
    this.subSink.sink = this.authorSvc
      .fetch(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe((author: Author) => {
        this._initForm(author);
      });
  }
  private _initAuthorIfUpdate() {
    const id = this.route.snapshot.params['id'];
    if (id && id !== '0') {
      this._fetchAuthor(id);
    }
    else {
      if (!this.author) {
        this._initForm();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.author && changes.author.currentValue !== null && changes.author.isFirstChange() &&
        changes.author.currentValue !== changes.author.previousValue) {
      this._initForm(changes.author.currentValue);
    }
  }
}
