import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[materialViewMode]'
})
export class ViewModeDirective {

  constructor(public tpl: TemplateRef<any>) { }
}
