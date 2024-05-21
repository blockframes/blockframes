import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components 
import { ScreeningComponent } from './screening.component';

// Modules
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { EventEmptyModule } from '@blockframes/event/components/empty/empty.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ScreeningComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventListModule,
    EventEmptyModule,
    ScreeningItemModule,
    MatIconModule,
    MatButtonModule,
    LogoSpinnerModule,
    RouterModule.forChild([{ path: '', component: ScreeningComponent }])
  ]
})
export class ScreeningModule { }
