import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { TitleComponent } from './title.component';

// Material
import { MatRippleModule } from '@angular/material/core';

// Modules
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { RequestScreeningModule } from '@blockframes/event/components/request-screening/request-screening.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [TitleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: TitleComponent }]),
    RequestScreeningModule,
    LogoSpinnerModule,
    ImageModule,
  ]
})
export class OrganizationTitleModule { }
