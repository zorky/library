import {AfterViewInit, Component, OnDestroy, OnInit, VERSION} from '@angular/core';
import {PubSubService} from './services/pubsub/pub-sub.service';
import {SubSink} from './services/subsink';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit, OnDestroy {
  title = 'library';
  loading = false;
  subSink = new SubSink();

  constructor(private pubSubSvc: PubSubService) {
    console.log('version angular : ', VERSION.full);
  }

  ngOnInit(): void {
    this.subSink.sink = this.pubSubSvc.on('loading')
      .subscribe((value) => setTimeout(() => this.loading = value));
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
