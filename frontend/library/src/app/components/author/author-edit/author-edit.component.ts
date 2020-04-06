import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {finalize} from "rxjs/operators";
import {Author, AuthorService, Book} from "../../../services";
import {SubSink} from "../../../services/subsink";

@Component({
  selector: 'app-author-edit',
  templateUrl: './author-edit.component.html',
  styleUrls: ['./author-edit.component.css']
})
export class AuthorEditComponent implements OnInit, OnDestroy {
  authorForm: FormGroup;
  maxInput = 25;
  loading = false;
  isUpdateMode = false;
  disabled = false;
  formDirty = false;
  subSink = new SubSink();

  constructor(private router: Router, private route: ActivatedRoute,
              private fb: FormBuilder, public snackBar: MatSnackBar,
              private authorSvc: AuthorService) { }

  ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

  ngOnInit(): void {
    this._initForm();
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
      });
  }
  goList() {
    this.router.navigate(['/authors']);
  }
  getLabelCancelOrReturn() {
    if (this.formDirty) {
      return 'Abandonner';
    }
    return 'Retourner';
  }

  private _initForm(author: Author = null) {
    this.isUpdateMode = author && author.id > 0;
    this.authorForm = this.fb.group({
      id: [author ? author.id : 0],
      first_name: [author?.first_name, Validators.required],
      last_name: [author?.last_name, Validators.required]
    });
    this.subSink.sink = this.authorForm.valueChanges.subscribe(values =>  {
      this.formDirty = true;
    });
  }

  private _initAuthorIfUpdate() {
    const id = this.route.snapshot.params['id'];
    if (id && id !== '0') {
      this.loading = true;
      this.subSink.sink = this.authorSvc
        .fetch(id)
        .pipe(finalize(() => this.loading = false))
        .subscribe((author: Author) => {
          this._initForm(author);
        });
    } else {
      this._initForm();
    }
  }
}