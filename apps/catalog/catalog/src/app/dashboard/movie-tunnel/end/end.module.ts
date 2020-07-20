import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { EndTunnelComponent } from './end.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EndTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    ImageReferenceModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: EndTunnelComponent }])
  ],
})
export class EndTunnelModule {}
