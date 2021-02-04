import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { NotificationsComponent } from './notifications.component';

// Modules
import { NotificationsFormModule } from '@blockframes/auth/forms/notifications-form/notifications-form.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NotificationsFormModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: NotificationsComponent }])
  ],
  declarations: [NotificationsComponent],
})
export class NotificationsModule { }
