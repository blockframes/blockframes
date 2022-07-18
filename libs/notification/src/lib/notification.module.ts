// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationListModule } from './components/list/list.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Page
import { NotificationComponent } from './notification.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/rive/logo-spinner.module'

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
