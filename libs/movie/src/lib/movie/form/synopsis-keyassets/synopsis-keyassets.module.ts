import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MovieFormSynopsisKeyAssetsComponent } from './synopsis-keyassets.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
// Materials
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@NgModule({
  declarations: [MovieFormSynopsisKeyAssetsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    // Materials
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forChild([{ path: '', component: MovieFormSynopsisKeyAssetsComponent }])
  ],
  exports: [MovieFormSynopsisKeyAssetsComponent]
})
export class MovieFormSynopsisKeyAssetsModule {}
