import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[host]',
})
export class ComponentHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
