import {Component, OnDestroy, OnInit} from '@angular/core';
import {Book, BookService} from './services';
import {SubSink} from "./services/subsink";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit, OnDestroy {
  title = 'library';

  constructor() {
  }

  ngOnInit(): void {

  }



  ngOnDestroy(): void {

  }
}
