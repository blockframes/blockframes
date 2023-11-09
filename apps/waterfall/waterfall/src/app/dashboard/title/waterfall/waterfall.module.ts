// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { EmptyWaterfallModule } from '@blockframes/waterfall/components/empty/empty.module';

// Pages
import { WaterfallComponent } from './waterfall.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    GraphModule,
    LogoSpinnerModule,
    ImageModule,
    EmptyWaterfallModule,

    // Material
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
