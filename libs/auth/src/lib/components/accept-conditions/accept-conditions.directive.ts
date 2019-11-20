import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: '[authConditions]'
})
export class AcceptConditionsDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
