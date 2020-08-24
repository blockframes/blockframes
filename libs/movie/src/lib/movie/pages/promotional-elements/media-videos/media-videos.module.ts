import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormMediaVideosComponent } from './media-videos.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [MovieFormMediaVideosComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,

    // Material
    MatFormFieldModule,
    MatInputModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormMediaVideosComponent }])
  ]
})
export class MediaFormVideosModule { }
