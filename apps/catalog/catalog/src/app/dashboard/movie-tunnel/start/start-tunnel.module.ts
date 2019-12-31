import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { StartTunnelComponent } from './start-tunnel.component';
// Materials
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StartTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: StartTunnelComponent }])
  ],
  exports: [StartTunnelComponent]
})
export class StartTunnelModule {}
