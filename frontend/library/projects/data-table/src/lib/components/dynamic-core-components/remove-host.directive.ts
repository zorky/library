import {Directive, ElementRef} from "@angular/core";

/**
 * Directive qui permet de retirer dans le DOM <add-banner> par exemple
 * https://stackoverflow.com/questions/34280475/remove-the-host-html-element-selectors-created-by-angular-component
 */
@Directive({
  selector: '[remove-host]'
})
export class RemoveHostDirective {
  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    // debugger;
    const nativeElement: HTMLElement = this.el.nativeElement, parentElement: HTMLElement = nativeElement.parentElement;
    // move all children out of the element
    while (nativeElement.firstChild) {
      parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }
    // remove the empty element(the host)
    parentElement.removeChild(nativeElement);
  }
}
