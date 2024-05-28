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
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
