import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { EventComponent } from './event.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatLayoutModule } from '../layout.module';

// Widgets
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AppLogoModule } from '../app-logo/app-logo.module';
import { FooterModule } from '../footer/footer.module';
import { AsideModule } from '../../../../../../apps/festival/festival/src/app/marketplace/aside/aside.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [EventComponent],
  exports: [EventComponent],
  imports: [
    // Angular
    RouterModule,
    CommonModule,
    FlexLayoutModule,
    AppLogoModule,
    FooterModule,
    AsideModule,

    // Material
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,

    // Libraries
    ImageModule,
    AppBarModule,

    // Widgets
    AuthWidgetModule,
  ]
})
export class EventLayoutModule { }
MatLayoutModule