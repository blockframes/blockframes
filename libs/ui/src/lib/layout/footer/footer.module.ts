// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

// Component
import { FooterComponent } from './footer.component';

// Blockframes
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    AppLogoModule,
    AppPipeModule,

    // Material
    MatButtonModule,
    MatDividerModule
  ],
  exports: [FooterComponent],
  declarations: [FooterComponent]
})
export class FooterModule {}
