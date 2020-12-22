import {Component, ElementRef, HostListener, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, Subject} from 'rxjs';
import {filter, finalize, switchMapTo, take} from 'rxjs/operators';
import {Book} from '../../../../../services';
import {BookDtService} from '../../../../../services/books/book-dt.service';
import {SubSink} from '../../../../../services/subsink';
import {ToastyService} from '../../../../../services/toasty/toasty.service';
import {ColumnComponent} from 'data-table';

@Component({
  selector: 'app-book-name',
  templateUrl: './book-name.component.html',
  styleUrls: ['./book-name.component.scss']
})
export class BookNameComponent implements ColumnComponent, OnInit, OnDestroy {
  column: string;
  data: any;
  input: Book;
  name: string;
  onEdit = false;
  model: string;
  subject: BehaviorSubject<any>;
  subject$: any;
  editMode = new Subject();
  editMode$ = this.editMode.asObservable();
  loading = false;
  subSink = new SubSink();
  constructor(private host: ElementRef,
              private toastySvc: ToastyService,
              private bookSvc: BookDtService) { }

  @HostListener('keyup.enter')
  onEnter() {
    if (this.model) {
      this.save();
    }
  }
  ngOnInit(): void {
    this.model = this.input?.name;
    /** edit dblClick https://netbasal.com/keeping-it-simple-implementing-edit-in-place-in-angular-4fd92c4dfc70 */
    this.viewModeHandler();
    this.editModeHandler();
  }
  goEdit(event) {
    this.model = this.input.name;
    this.onEdit = true;
  }
  cancel(event) {
    this.onEdit = false;
  }
  save() {
    const book = this.input;
    book.name = this.model;
    this.loading = true;
    this.subSink.sink = this.bookSvc
      .patch(book)
      .pipe((finalize(() => this.loading = false)))
      .subscribe((b) => {
        this.toastySvc.toasty(
        `Titre bien modifié en "${this.model}"`, `Livre "${this.input.name}"`);
        this.onEdit = false;
      });
  }
  private get element() {
    return this.host.nativeElement;
  }
  private viewModeHandler() {
    this.subSink.sink = fromEvent(this.element, 'dblclick')
      .subscribe(() => {
        this.loading = true;
        this.onEdit = true;
        this.editMode.next(true);
        setTimeout(() => this.loading = false, 500);
    });
  }
  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    );
    this.subSink.sink = this.editMode$.pipe(
      switchMapTo(clickOutside$),
    ).subscribe(event => this.onEdit = false);
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
