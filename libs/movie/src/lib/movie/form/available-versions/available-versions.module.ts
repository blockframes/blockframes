// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieFormAvailableVersionsComponent } from './available-versions.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { LanguagesFormModule } from '../languages/languages.module';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    TunnelPageModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    LanguagesFormModule,
    RouterModule.forChild([{ path: '', component: MovieFormAvailableVersionsComponent }]),

    // Material
    MatSlideToggleModule,

  ],
  declarations: [MovieFormAvailableVersionsComponent],
})
export class MovieFormAvailableVersionsModule { }
