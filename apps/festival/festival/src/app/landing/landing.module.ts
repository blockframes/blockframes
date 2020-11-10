import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LandingComponent } from './landing.component';
import { LandingShellModule } from '@blockframes/landing/shell/shell.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    LandingShellModule,
    ReactiveFormsModule,
    ImageReferenceModule,
    // Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: LandingComponent }])
  ]
})
export class FestivalLandingModule { }
