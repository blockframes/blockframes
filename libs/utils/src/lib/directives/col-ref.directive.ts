import { Directive, TemplateRef, Input, NgModule } from '@angular/core'
/**
 * This directive is to be used inside the table-filter component on a ng-template
 * @example `<ng-template colRef="director" let-director> {{ director.firstName }}</ng-template>`
 * @dev Use the name of the column in colRef & let-[name here]
 */
@Directive({ selector: '[colRef]' })
export class ColRefDirective {
  /** This should be the name of the column this template will be used into. */
  @Input() colRef: string;
  constructor(public template: TemplateRef<unknown>) { }
}

@NgModule({
  exports: [ColRefDirective],
  declarations: [ColRefDirective]
})
export class ColRefModule {}
