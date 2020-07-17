import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MovieFormEndComponent } from './end.component';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [MovieFormEndComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ImageReferenceModule,
    RouterModule.forChild([{ path: '', component: MovieFormEndComponent }])
  ],
})
export class EndTunnelModule {}
