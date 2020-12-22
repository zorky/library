import { Directive, ViewContainerRef } from '@angular/core';

/**
 * directive host-view-container : pour obtenir une référence du container qui l'utilise
 */
@Directive({
  selector: '[hostViewContainer]',
})
export class HostViewHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
