import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DistributionRightCreateComponent } from './create.component';

// Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [DistributionRightCreateComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule.forChild([{ path: '', component: DistributionRightCreateComponent }])
  ]
})
export class DistributionRightCreateModule {}
