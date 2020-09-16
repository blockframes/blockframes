import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtisticComponent } from './artistic.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ArtisticComponent],
  imports: [
    CommonModule,
    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: ArtisticComponent }])
  ]
})
export class MovieArtisticModule { }
