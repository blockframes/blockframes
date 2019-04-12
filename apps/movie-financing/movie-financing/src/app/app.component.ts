import { Component, HostListener } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'movie-financing-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  constructor(private query: AuthQuery) {}

  @HostListener('window:beforeunload', ['$event'])
  closeProtection($event: any) {
    if (this.query.getValue().isEncrypting) {
      $event.returnValue = 'Some critical data are still being processed and will be lost forever if you leave now !';
    }
  }
}
