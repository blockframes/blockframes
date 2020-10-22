import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

// Components
import { LobbyComponent } from './lobby.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';


@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    ImageReferenceModule,

    MatProgressSpinnerModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: LobbyComponent }])
  ]
})
export class LobbyModule { }
