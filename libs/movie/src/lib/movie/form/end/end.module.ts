import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MovieFormEndComponent } from './end.component';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppPipeModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [MovieFormEndComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ImageModule,
    AppPipeModule,
    RouterModule.forChild([{ path: '', component: MovieFormEndComponent }])
  ],
})
export class EndTunnelModule {}
