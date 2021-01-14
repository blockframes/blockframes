import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestItemComponent } from './guest-item.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { StatusModule } from '../../pipes/status.pipe';
import { GuestPipeModule } from '../../pipes/guest.pipe';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [GuestItemComponent],
  exports: [GuestItemComponent],
  imports: [
    CommonModule,
    ImageModule,
    StatusModule,
    GuestPipeModule,
    DisplayUserModule,
    // Theme
    MatListModule,
    MatIconModule
  ]
})
export class GuestItemModule { }
