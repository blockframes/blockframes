import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { AnonymousComponent } from './anonymous.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Widgets
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppBarModule } from '../../app-bar';
import { AppLogoModule } from '../app-logo/app-logo.module';
import { FooterModule } from '../footer/footer.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [AnonymousComponent],
  exports: [AnonymousComponent],
  imports: [
    // Angular
    RouterModule,
    CommonModule,
    ScrollingModule,
    FlexLayoutModule,
    AppLogoModule,
    FooterModule,

    // Material
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatDialogModule,

    // Libraries
    ImageModule,
    AppBarModule,

    // Widgets
    AuthWidgetModule,
  ]
})
export class AnonymousLayoutModule { }