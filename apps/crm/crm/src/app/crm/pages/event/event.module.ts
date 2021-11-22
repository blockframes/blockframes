import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { InvitationFormUserModule } from '@blockframes/invitation/form/user/user.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Modules
import { EventInfoModule } from '../../components/event-info/event-info.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GoToModule } from '../../components/go-to/go-to.module';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { GuestTableModule } from '../../components/guest-table/guest-table.module';

// Components
import { EventComponent } from './event.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    FlexLayoutModule,
    EventInfoModule,
    RouterModule,
    GoToModule,
    MatButtonModule,
    ImageModule,
    InvitationFormUserModule,
    BreadCrumbModule,
    GuestTableModule
  ],
  declarations: [
    EventComponent,
  ]
})
export class EventModule { }
