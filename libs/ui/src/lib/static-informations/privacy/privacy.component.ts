import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'bf-privacy',
  template: '<auth-privacy-policy></auth-privacy-policy>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent {}
