import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';
import {Author, AuthorService, Book} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {ToastyService} from "../../../services/toasty/toasty.service";

@Component({
  selector: 'app-author-edit',
  templateUrl: './author-edit.component.html',
  styleUrls: ['./author-edit.component.css']
})
export class AuthorEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() author: Author;
  @Input() onReturn = 'list'; // 'list' || ''
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
              private toastySvc: ToastyService,
              private authorSvc: AuthorService) {
  }

  ngOnInit(): void {
    this._initAuthorIfUpdate();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.author && changes.author.currentValue !== null && changes.author.isFirstChange() &&
      changes.author.currentValue !== changes.author.previousValue) {
      this._initForm(changes.author.currentValue);
    }
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
  /**
   * Sauvegarde de l'auteur
   * A l'issue :
   * - snackbar de confirmation
   * - initialisation du formulaire avec les valeurs (notamment pour l'id qui peut changer de 0 à N si ajout)
   * - notification Output de la sauvegarde
   */
  save() {
    this.disabled = this.loading = true;
    this.authorSvc
      .updateOrcreate(this.authorForm.value)
      .pipe(finalize(() => this.disabled = this.loading = false))
      .subscribe((author: Author) => {
        this.toastySvc.toasty(
          `"${author.first_name} ${author.last_name}" bien ${this.isUpdateMode ? 'mis à jour' : 'ajouté'}`,
          'Auteur');
        this._initForm(author);
        this.authorUpdated.emit(author);
      });
  }

  /**
   * Retour à la liste selon le onReturn
   */
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
    return 'Fermer';
  }

  /**
   * PRIVATE
   *
   **/

  /**
   * Initialisation du FormGroup avec les contrôles : id, first_name, last_name
   * - on met les valeurs dans le cas d'une modification le cas échéant
   * - on écoute le valueChanges pour détecter toutes modifications des champs => changement du libellé du bouton de gauche
   * @param {Author} author : l'auteur [optionnel]
   * @private
   */
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

  /**
   * Recherche d'un auteur par son id, initialisation du formulaire avec ses valeurs
   * @param {number} id : id de l'auteur recherché
   * @private
   */
  private _fetchAuthor(id: number) {
    this.loading = true;
    this.subSink.sink = this.authorSvc
      .fetch(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe((author: Author) => {
        this._initForm(author);
      });
  }

  /**
   * Si le component n'est pas inclus dans une modale alors la route est garnie par son id : /author/edit;id=1
   * Si l'author n'est pas injecté via l'Input
   * alors une initialise le formulaire vide
   * @private
   */
  private _initAuthorIfUpdate() {
    const id = this.route.snapshot.params['id'];
    if (id && id !== '0') {
      this._fetchAuthor(id);
    } else {
      if (!this.author) {
        this._initForm();
      }
    }
  }
}
