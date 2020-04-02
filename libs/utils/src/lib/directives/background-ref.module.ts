import { CommonModule } from '@angular/common';
import { BackgroundRefDirective } from './background-ref.directive';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [CommonModule],
    declarations: [BackgroundRefDirective],
    exports: [BackgroundRefDirective]
})
export class BackgroundRefModule { }