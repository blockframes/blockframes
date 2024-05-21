﻿// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Page
import { NotificationComponent } from './notification.component';

// Material
import { MMatLegacyButtonModule as MatButtonModule} from '@@angular/material/legacy-button;
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { NotificationListModule } from './components/list/list.module';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    // Angular
    CommonModule,
    FlexLayoutModule,
    NotificationListModule,
    ImageModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Blockframes
    LogoSpinnerModule,

    RouterModule.forChild([{ path: '', component: NotificationComponent }])
  ]
})
export class NotificationModule {}
