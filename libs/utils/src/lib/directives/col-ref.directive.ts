import { Directive, TemplateRef, Input, NgModule } from '@angular/core'
/**
 * This directive is to be used inside the table-filter component on a ng-template
 * @example `<ng-template colRef="director" let-director> {{ director.firstName }}</ng-template>`
 * @dev Use the name of the column in colRef & let-[name here]
 */
@Directive({ selector: '[colRef]' })
// tslint:disable-next-line: directive-class-suffix
export class ColRef {
  /** This should be the name of the column this template will be used into. */
  @Input() colRef: string;
  constructor(public template: TemplateRef<any>) { }
}

@NgModule({
  exports: [ColRef],
  declarations: [ColRef]
})
export class ColRefModule {} 