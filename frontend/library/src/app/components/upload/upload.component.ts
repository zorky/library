import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Observable} from 'rxjs';
import {Upload} from 'ngx-operators';
import {HttpClient} from '@angular/common/http';
import {SubSink} from '../../services/subsink';
import {DaoGeneric} from 'data-table';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnChanges, OnDestroy {
  upload$: Observable<Upload>;
  subSink = new SubSink();
  public _file: File | null = null;
  @Input() set file(val: File | null) {
    console.log('set file ', val);
    this._file = val;
  }
  get file() {
    console.log('get file ', this._file);
    return this._file;
  }
  @Input() label;
  @Input() startUpload = false;
  @Input() id: number | string = null;
  private _svcUpload: DaoGeneric<any>;
  @Input() svcUpload(value: DaoGeneric<any>) {
    this._svcUpload = value;
  }
  private _fctUpload: (id: number | string, file: File) => Observable<any>;
  @Input() fctUpload(value: (id: number | string, file: File) => Observable<any>) {
    this._fctUpload = value;
  }
  @Output() onUploaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('fileInput')
  set fileInput(val: ElementRef) {
    if (val) {
      this.file = val.nativeElement.value;
      console.log(val);
    }
  }
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }
  setFile(files: FileList) {
    this.file = files?.item(0);
  }
  upload(file: any | null) {
    console.log('file ', file);
    if (!file || ! this.id) {
      return;
    }
    console.log('upload ', this._fctUpload);
    if (this._fctUpload && this._svcUpload) {
      this.upload$ = this._fctUpload.call(this.svcUpload, this.id, file);
      this.subSink.sink = this.upload$.subscribe(((value) => {
        if (value.state === 'DONE') {
          this.onUploaded.emit(true);
        }
      }));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fctUpload && changes.fctUpload.isFirstChange() && changes.fctUpload.currentValue) {
      this._svcUpload = changes.svcUpload.currentValue;
      this._fctUpload = changes.fctUpload.currentValue;
    }
    if (changes.startUpload && changes.startUpload.currentValue) {
      this.upload(this.file);
    }
    if (changes.file && changes.file.currentValue) {
      this._file = changes.file.currentValue;
      console.log(changes.file.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
