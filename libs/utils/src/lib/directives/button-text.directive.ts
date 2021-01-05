import { Directive, NgModule } from "@angular/core";

@Directive({ selector: '[saveButtonText]' })
export class SaveButtonTextDirective { }

@Directive({ selector: '[addButtonText]' })
export class AddButtonTextDirective { }

@NgModule({
    exports: [SaveButtonTextDirective, AddButtonTextDirective],
    declarations: [SaveButtonTextDirective, AddButtonTextDirective]
})
export class ButtonTextModule { } 