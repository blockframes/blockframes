import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LandingPageFooterComponent } from './landing-page-footer.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [LandingPageFooterComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  exports: [LandingPageFooterComponent]
})
export class LandingPageFooterModule {}
