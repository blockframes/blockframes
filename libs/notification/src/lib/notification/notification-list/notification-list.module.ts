import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.module';
import { PathAssetModule } from '@blockframes/ui/theme';

// Components
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [NotificationListComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    AvatarListModule,
    ReverseModule,
    ImageReferenceModule,
    PathAssetModule,
    // Material
    MatListModule,
    MatTooltipModule,
    MatDividerModule
  ],
  exports: [NotificationListComponent]
})
export class NotificationListModule {}
