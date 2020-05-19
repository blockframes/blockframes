// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';


// Libraries
// import { ToolbarModule } from '@blockframes/ui/toolbar';
// import { KeyManagerModule } from '@blockframes/ethers';
// import { EmailVerifyModule } from '@blockframes/auth'; // @TODO (#2821)
import { ImgAssetModule } from '@blockframes/ui/theme';

// Widgets
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
import { NotificationWidgetModule } from '@blockframes/notification/notification-widget/notification-widget.module';
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [LayoutComponent],
  exports: [LayoutComponent],
  imports: [
    // Angular
    CommonModule,
    FlexLayoutModule,
    RouterModule,

    // Material
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,

    // Libraries
    ImgAssetModule,

    // Widgets
    NotificationWidgetModule,
    SearchWidgetModule,
    AuthWidgetModule,
  ],
})
export class LayoutModule {}
