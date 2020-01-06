import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { StartTunnelComponent } from './start-tunnel.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
// Materials
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StartTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MatCardModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: StartTunnelComponent }])
  ],
})
export class StartTunnelModule {}
