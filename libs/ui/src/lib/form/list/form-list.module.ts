// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListComponent, ItemRefDirective, FormViewDirective } from './form-list.component';
import { LineButtonModule } from '../line-button/line-button.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    LineButtonModule,

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