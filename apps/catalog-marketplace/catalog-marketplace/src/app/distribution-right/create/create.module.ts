import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DistributionRightCreateComponent } from './create.component';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [DistributionRightCreateComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: DistributionRightCreateComponent }])
  ]
})
export class DistributionRightCreateModule {}
