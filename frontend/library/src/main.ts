import {enableProdMode, NgModuleRef} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {AppInjector} from './app/common/injector';

if (environment.production) {
  enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule);
  // .then((moduleRef) => AppInjector.setInjector(moduleRef.injector))
  // .catch(err => {
  //  debugger;
  //  console.error(err);
  // });
