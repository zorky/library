import {Directive, ElementRef, OnInit} from "@angular/core";

/**
 * Permet de retirer dans le DOM le conteneur trouvé par host-view-container (<add-banner> par exemple)
 * https://stackoverflow.com/questions/34280475/remove-the-host-html-element-selectors-created-by-angular-component
 */
@Directive({
  selector: '[removeHostViewContainer]'
})
export class RemoveHostViewContainerDirective implements OnInit{
  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    const nativeElement: HTMLElement = this.el.nativeElement;
    const parentElement: HTMLElement = nativeElement.parentElement;
    // move all children out of the element
    while (nativeElement.firstChild) {
      parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }
    // remove the empty element(the host)
    parentElement.removeChild(nativeElement);
  }
}
