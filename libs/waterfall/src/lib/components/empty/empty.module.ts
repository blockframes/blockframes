// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Pages
import { EmptyWaterfallComponent } from './empty.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EmptyWaterfallComponent],
  imports: [
    CommonModule,
    RouterModule,

    ImageModule,
    LogoSpinnerModule,

    // Material
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  exports: [EmptyWaterfallComponent]
})
export class EmptyWaterfallModule { }
