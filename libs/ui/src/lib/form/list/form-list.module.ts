// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { FormListComponent, ItemRefDirective, FormViewDirective } from './form-list.component';
import { ButtonTextModule } from '@blockframes/utils/directives/button-text.directive';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ButtonTextModule,

    // Material
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  exports: [FormListComponent, FormViewDirective, ItemRefDirective, ButtonTextModule],
  declarations: [FormListComponent, FormViewDirective, ItemRefDirective],

})
export class FormListModule { }
