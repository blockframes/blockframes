// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { InvitationComponent } from './invitation.component';
import { InvitationListModule } from './components/list/list.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [InvitationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    InvitationListModule,
    ImageModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: InvitationComponent }]),

    // Material
    MatIconModule,
    MatButtonModule,
  ]
})
export class InvitationModule { }
