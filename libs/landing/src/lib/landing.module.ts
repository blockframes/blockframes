import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingFooterComponent } from './footer/footer.component';
import { LandingHeaderComponent } from './header/header.component';
import { LandingHowItWorksComponent } from './how-it-works/how-it-works.component';
import { LandingLearnMoreComponent } from './learn-more/learn-more.component';
import { LandingToolbarComponent } from './toolbar/toolbar.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module';

// Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    LandingFooterComponent,
    LandingHeaderComponent,
    LandingHowItWorksComponent,
    LandingLearnMoreComponent,
    LandingToolbarComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ImgAssetModule,
    TelInputModule,

    // Material
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatListModule
  ],
  exports: [
    LandingFooterComponent,
    LandingHeaderComponent,
    LandingHowItWorksComponent,
    LandingLearnMoreComponent,
    LandingToolbarComponent
  ]
})
export class LandingModule {}
