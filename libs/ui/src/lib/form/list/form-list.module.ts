// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
// Pipe
import { ReverseModule } from '@blockframes/utils/pipes/reverse.pipe';
// Component
import { FormListComponent, ItemRefDirective, FormViewDirective } from './form-list.component';
// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    ReverseModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [FormListComponent, FormViewDirective, ItemRefDirective],
  declarations: [FormListComponent, FormViewDirective, ItemRefDirective],

})
export class FormListModule { }
