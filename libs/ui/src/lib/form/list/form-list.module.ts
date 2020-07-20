// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListComponent } from './form-list.component';
import { FormViewDirective } from '../table/form-table.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,

    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [FormListComponent, FormViewDirective],
  declarations: [FormListComponent, FormViewDirective],

})
export class FormListModule { }