import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormMediaVideosComponent } from './media-videos.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieFormMediaVideosComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    FormListModule,
    MaxLengthModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormMediaVideosComponent }])
  ]
})
export class MediaFormVideosModule { }
