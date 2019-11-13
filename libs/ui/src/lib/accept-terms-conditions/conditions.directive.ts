import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[conditions]'
})
export class ConditionsDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
