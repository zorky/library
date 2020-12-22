import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';

/**
 * Pub Sub service Subscription
 * Evènements components to components
 *
 * @example
 * inscription
 *
 * this.pubsubService.on('loading').subscribe((msg) => {
 *       console.log('action ! valeur : ', msg);
 * })
 *
 * publication
 *
 * this.pubSubSvc.publish('loading', true);
 */
@Injectable({ providedIn: 'root' })
export class PubSubService {
  private subjects: Subject<any>[] = [];

  publish(eventName: string, value: any = null) {
    this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();
    this.subjects[eventName].next(value);
  }

  on(eventName: string): Observable<any> {
    this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();
    return this.subjects[eventName].asObservable();
  }
}
