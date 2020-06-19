import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { EndTunnelComponent } from './end.component';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  declarations: [EndTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    ImgModule,
    RouterModule.forChild([{ path: '', component: EndTunnelComponent }])
  ],
})
export class EndTunnelModule {}
