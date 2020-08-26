import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LandingFooterComponent } from './footer/footer.component';
import { LandingHeaderComponent } from './header/header.component';
import { LandingHowItWorksComponent } from './how-it-works/how-it-works.component';
import { LandingLearnMoreComponent } from './learn-more/learn-more.component';
import { LandingToolbarComponent } from './toolbar/toolbar.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { TelInputModule } from '@blockframes/ui/tel-input/tel-input.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { RoleModule } from './learn-more/role.pipe';
import { RouterModule } from '@angular/router';

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
    AppLogoModule,
    TelInputModule,
    ImageReferenceModule,
    RoleModule,

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
    MatListModule,
    RouterModule
  ],
  exports: [
    LandingFooterComponent,
    LandingHeaderComponent,
    LandingHowItWorksComponent,
    LandingLearnMoreComponent,
    LandingToolbarComponent
  ]
})
export class LandingModule { }
