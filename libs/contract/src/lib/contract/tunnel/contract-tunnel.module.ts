import { FlexLayoutModule } from '@angular/flex-layout';
import { ContractTunnelRoutingModule } from './contract-tunnel-routing.module';
import { ContractTunnelComponent } from './contract-tunnel.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TunnelLayoutModule } from '@blockframes/ui/tunnel';
import { ImgAssetModule } from '@blockframes/ui/theme';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    ContractTunnelRoutingModule,
    TunnelLayoutModule,
    FlexLayoutModule,
    ImgAssetModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  declarations: [ContractTunnelComponent],
})
export class ContractTunnelModule {}
