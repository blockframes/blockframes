// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { AuthDataValidationComponent } from './data-validation.component';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [AuthDataValidationComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    AppPipeModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  exports: [AuthDataValidationComponent]
})
export class AuthDataValidationModule {}
