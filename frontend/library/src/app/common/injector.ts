import { Injector } from '@angular/core';

export class AppInjector {
  private static injector: Injector;
  static setInjector(injector: Injector) {
    console.log(injector);
    AppInjector.injector = injector;
  }
  static getInjector(): Injector {
    console.log(AppInjector.injector);
    return AppInjector.injector;
  }
}
