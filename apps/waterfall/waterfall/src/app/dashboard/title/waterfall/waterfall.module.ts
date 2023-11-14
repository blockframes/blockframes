// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Pages
import { WaterfallComponent } from './waterfall.component';
import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { WaterfallGraphModule } from '@blockframes/waterfall/components/graph/graph.module';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    LogoSpinnerModule,
    ImageModule,
    EmptyWaterfallModule,
    GraphModule,
    WaterfallGraphModule,

    // Material
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
