import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestItemComponent } from './guest-item.component';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';
import { StatusModule } from '../../pipes/status.pipe';
import { GuestPipeModule } from '../../pipes/guest.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [GuestItemComponent],
  exports: [GuestItemComponent],
  imports: [
    CommonModule,
    ImgModule,
    DisplayNameModule,
    StatusModule,
    GuestPipeModule,
    // Theme
    MatListModule,
    MatIconModule
  ]
})
export class GuestItemModule { }
