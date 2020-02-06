import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LobbyComponent } from './lobby.component';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    ImgAssetModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class ContractTunnelLobbyModule { }
