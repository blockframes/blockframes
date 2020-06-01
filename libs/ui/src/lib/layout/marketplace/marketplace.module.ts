import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { MatLayoutModule } from '../layout.module';

// Widgets
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AppLogoModule } from '../app-logo/app-logo.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [MarketplaceComponent],
  exports: [MarketplaceComponent],
  imports: [
    // Angular
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ScrollingModule,
    MatLayoutModule,
    AppLogoModule,

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
    ImageReferenceModule,
    AppBarModule,

    // Widgets
    SearchWidgetModule,
    AuthWidgetModule,
  ]
})
export class MarketplaceLayoutModule { }
