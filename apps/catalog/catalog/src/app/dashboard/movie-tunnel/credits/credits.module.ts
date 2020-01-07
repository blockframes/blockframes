import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { CreditsComponent } from './credits.component';
import { MovieFormMainModule } from '@blockframes/movie/form/main/main.module';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [CreditsComponent],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      TunnelPageModule,
      MovieFormMainModule,
      // Material
      MatCardModule,
      // Route
      RouterModule.forChild([{ path: '', component: CreditsComponent }])
    ]
  })
  export class CreditsModule { }