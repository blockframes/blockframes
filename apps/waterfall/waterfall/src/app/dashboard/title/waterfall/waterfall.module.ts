// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { WaterfallGraphReadOnlyModule } from '@blockframes/waterfall/components/graph/read-only/read-only.module';
import { WaterfallSidebarModule } from '@blockframes/waterfall/components/sidebar/sidebar.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Pages
import { WaterfallComponent } from './waterfall.component';


@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    LogoSpinnerModule,
    WaterfallGraphReadOnlyModule,
    VersionSelectorModule,
    WaterfallSidebarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
