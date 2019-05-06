import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';

//Modules
import { OrganizationModule } from '@blockframes/organization';
import { AuthModule } from '@blockframes/auth';
import { AccountModule } from '@blockframes/account';
import { NotificationModule } from '../notification/notification.module';
import { RouterModule } from '@angular/router';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule, MatListModule, MatTabsModule, MatFormFieldModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    OrganizationModule,
    AuthModule,
    AccountModule,
    NotificationModule,
    RouterModule,

    // Material
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatTabsModule,
    MatGridListModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [HeaderComponent, ContextMenuComponent],
  exports: [HeaderComponent]
})
export class ToolbarModule {}
