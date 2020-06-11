import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'bf-terms',
  template: `<auth-terms-conditions></auth-terms-conditions>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent {}