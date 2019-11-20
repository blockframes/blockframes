import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: '[conditions]'
})
export class AcceptConditionsDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
