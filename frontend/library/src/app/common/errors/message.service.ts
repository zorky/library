import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {Message} from "./message.model";

@Injectable({ providedIn: 'root' })
export class MessageService {
  private message: Message[] = [];
  private messageSource = new Subject<Message[]>();

  messageSelected$ = this.messageSource.asObservable();

  constructor() {
  }

  sendMessage(message: Message) {
    this.message.push(message);
    this.messageSource.next(this.message);
  }
  clearMessage(i: number){
    this.message.splice(i, 1);
    this.messageSource.next(this.message);
  }
  clearMessages() {
    while (this.message.length > 0 ) {
      this.message.pop();
    }
    this.messageSource.next(this.message);
  }

}
