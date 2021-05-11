import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { MarketplaceMovieAvailsComponent } from './avails.component';
import { MapModule } from '@blockframes/ui/map';
import { RegionChipsAutocompleteModule } from '@blockframes/ui/form/region-chips-autocomplete/region-chips-autocomplete.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { InputAutocompleteModule } from '@blockframes/ui/static-autocomplete/input/input-autocomplete.module';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { AvailsCalendarModule } from '@blockframes/contract/avails/calendar/calendar.module';
import { ExplanationModule } from './explanation/explanation.module';
import { AvailsGuard } from './avails.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [MarketplaceMovieAvailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MapModule,
    RegionChipsAutocompleteModule,
    ToLabelModule,
    OverlayWidgetModule,
    OrgNameModule,
    InputAutocompleteModule,
    StaticGroupModule,
    LanguagesFormModule,
    ConfirmModule,
    AvailsCalendarModule,
    ExplanationModule,

    // Material
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,

    RouterModule.forChild([{ path: '', component: MarketplaceMovieAvailsComponent, canDeactivate: [AvailsGuard] }])
  ]
})
export class MarketplaceMovieAvailsModule { }
