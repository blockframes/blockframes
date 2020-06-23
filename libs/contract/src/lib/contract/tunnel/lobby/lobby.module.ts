import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LobbyComponent } from './lobby.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';

import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    // Material
    MatCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class ContractTunnelLobbyModule { }
