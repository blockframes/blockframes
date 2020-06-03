// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { PromotionalLinksComponent } from './promotional-links.component';

// Modules
import { PromotionalLinksPipeModule } from './promotional-links.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [PromotionalLinksComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    PromotionalLinksPipeModule,
    MatButtonModule,

    // Material
    MatIconModule,
    MatMenuModule
  ],
  exports: [PromotionalLinksComponent]
})
export class PromotionalLinksModule { }
