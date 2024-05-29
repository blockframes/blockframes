// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';

// Component
import { FooterComponent } from './footer.component';

// Blockframes
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    AppPipeModule,

    // Material
    MatButtonModule,
    MatDividerModule
  ],
  exports: [FooterComponent],
  declarations: [FooterComponent]
})
export class FooterModule {}
