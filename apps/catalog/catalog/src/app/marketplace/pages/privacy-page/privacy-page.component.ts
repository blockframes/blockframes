import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'catalog-privacy-page',
  template: '<auth-terms-conditions></auth-terms-conditions>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPageComponent {

  constructor() {}
}
