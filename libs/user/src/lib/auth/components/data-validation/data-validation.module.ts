// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { AuthDataValidation } from './data-validation.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [AuthDataValidation],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule
  ],
  exports: [AuthDataValidation]
})
export class AuthDataValidationModule {}
