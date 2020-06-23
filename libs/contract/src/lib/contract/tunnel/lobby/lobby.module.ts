import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LobbyComponent } from './lobby.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';

import { ImgModule } from '@blockframes/media/components/img/img.module';

@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgModule,
    // Material
    MatCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class ContractTunnelLobbyModule { }
