import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Observable} from 'rxjs';
import {Upload, upload} from 'ngx-operators';
import {HttpClient} from '@angular/common/http';
import {Book, BookService} from '../../services';
import {finalize, tap} from 'rxjs/operators';
import {SubSink} from '../../services/subsink';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnChanges, OnDestroy {
  @Input() file: File | null = null;
  @Input() label;
  @Input() startUpload = false;
  @Input() book: Book;
  @Output() onUploaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('fileInput')
  set fileInput(val: ElementRef) {
    if (val) {
      this.file = val.nativeElement.value;
      console.log(val);
    }
  }
  upload$: Observable<Upload>;
  subSink = new SubSink();
  constructor(private http: HttpClient,
              private bookSvc: BookService) { }

  ngOnInit(): void {
  }
  setFile(files: FileList) {
    const file = files?.item(0);
    this.file = file;
  }
  upload(file: any | null) {
    console.log('file ', file);
    if (!file || ! this.book) {
      return;
    }
    this.upload$ = this.bookSvc.upLoadPicture(this.book, file);
    this.subSink.sink = this.upload$.subscribe(((value) => {
      if (value.state === 'DONE') {
        this.onUploaded.emit(true);
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.startUpload && changes.startUpload.currentValue) {
      this.upload(this.file);
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
