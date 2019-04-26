import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[materialEditMode]'
})
export class EditModeDirective {
  constructor(public tpl: TemplateRef<any>) { }
}
