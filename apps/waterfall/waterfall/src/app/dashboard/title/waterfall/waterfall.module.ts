// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Pages
import { WaterfallComponent } from './waterfall.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    GraphModule,
    LogoSpinnerModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
