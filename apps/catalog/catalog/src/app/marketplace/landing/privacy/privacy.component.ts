import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'catalog-privacy',
  template: '<auth-terms-conditions></auth-terms-conditions>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyComponent {

  constructor() {}
}
