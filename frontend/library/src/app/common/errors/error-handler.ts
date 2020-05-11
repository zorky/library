import { ErrorHandler, Injectable } from '@angular/core';
import {MessageService} from './message.service';
import {Message} from './message.model';

@Injectable({ providedIn: 'root' })
export default class HandlerError extends ErrorHandler {
  constructor(private messageService: MessageService) {
    super();
  }
  handleError(error: any): void {
    console.log(error);
    let message = error.message || error.error || error;

    // prise en compte erreurs de champs, par exemple error.reference["erreur sur ce champ"]
    for (const k in message) {
      if (message.hasOwnProperty(k) && Array.isArray(message[k])) {
        if (message[k].every(item => typeof item === 'string')) {
          const msgs =  message[k].reduce((acc, currentValue, idx) => {
            return idx === 0 ? currentValue : `${acc} ${currentValue}`;
          }, '');

          message = `${k} : ${msgs}`;
          console.log('msgs : ', msgs);
        }
      }
    }
    // Http error from django
    if ('detail' in error) {
      message = error.detail;
    }

    if ('error' in error && 'detail' in error.error) {
      message = error.error.detail;
    }

    /**
     * Http error field from django
     */
    if ('non_field_errors' in error) {
      message = error.non_field_errors;
    }
    if ('name' in error) {
      message = error.name[0];
    }

    console.dir(error);
    this.messageService.sendMessage({label: 'Erreur', message, color: 'red', icon: 'error'} as Message);
  }

}
