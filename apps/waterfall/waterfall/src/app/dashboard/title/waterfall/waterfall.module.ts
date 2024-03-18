// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { WaterfallGraphModule } from '@blockframes/waterfall/components/graph/graph.module';
import { WaterfallSidebarModule } from '@blockframes/waterfall/components/sidebar/sidebar.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';

// Pages
import { WaterfallComponent } from './waterfall.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    LogoSpinnerModule,
    ImageModule,
    WaterfallGraphModule,
    VersionSelectorModule,
    WaterfallSidebarModule,

    // Material
    MatButtonModule,

    // Routing
    RouterModule.forChild([{
      path: '', 
      canActivate: [WaterfallAdminGuard], // Temp #9703 - remove once we allow non-admin to view waterfall
      component: WaterfallComponent
    }]),
  ],
})
export class WaterfallModule { }
