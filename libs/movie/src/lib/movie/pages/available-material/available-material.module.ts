// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Components
import { MovieFormAvailableMaterialComponent } from './available-material.component';
import { TunnelLayoutModule } from '@blockframes/ui/tunnel';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    TunnelLayoutModule,
    FormListModule,

    RouterModule.forChild([{ path: '', component: MovieFormAvailableMaterialComponent }]),

    // Material
    MatCheckboxModule
  ],
  declarations: [MovieFormAvailableMaterialComponent],
})
export class MovieFormAvailableMaterialModule { }
