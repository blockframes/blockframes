// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { PromotionalLinksComponent } from './promotional-links.component';

// Modules
import { PromotionalLinksPipeModule } from './promotional-links.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [PromotionalLinksComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    PromotionalLinksPipeModule,

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [PromotionalLinksComponent]
})
export class PromotionalLinksModule { }
