import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StakeholderListComponent } from './list/list.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { StakeholderViewComponent } from './view/view.component';
import { StakeholderItemComponent } from './item/item.component';
import { MatSidenavModule, MatCheckboxModule } from '@angular/material';
import { DirectivesModule } from '@blockframes/ui';

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
  ],
  declarations: [StakeholderListComponent, StakeholderViewComponent, StakeholderItemComponent]
})
export class StakeholderModule {}
