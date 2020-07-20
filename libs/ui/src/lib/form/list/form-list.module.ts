// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListComponent, ItemRefDirective, FormViewDirective } from './form-list.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [FormListComponent, FormViewDirective, ItemRefDirective],
  declarations: [FormListComponent, FormViewDirective, ItemRefDirective],

})
export class FormListModule { }
