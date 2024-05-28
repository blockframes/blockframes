import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScopeMultiselectComponent } from './scope-multiselect.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToLabelModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule
  ],
  declarations: [ScopeMultiselectComponent],
  exports: [ScopeMultiselectComponent],
})
export class ScopeMultiselectModule {}
