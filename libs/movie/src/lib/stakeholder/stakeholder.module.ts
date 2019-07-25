import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { StakeholderViewComponent } from './pages/stakeholder-view/stakeholder-view.component';
import { StakeholderItemComponent } from './components/stakeholder-item/stakeholder-item.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DirectivesModule, TeamWorkModule } from '@blockframes/ui';
import { NgAisModule } from 'angular-instantsearch';
import { MatListModule } from '@angular/material/list';
import { StakeholderRepertoryComponent } from './components/stakeholder-repertory/stakeholder-repertory.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSidenavModule,
    MatCheckboxModule,
    DirectivesModule,
    TeamWorkModule,
    NgAisModule,
    MatListModule
  ],
  declarations: [StakeholderRepertoryComponent, StakeholderViewComponent, StakeholderItemComponent]
})
export class StakeholderModule {}
