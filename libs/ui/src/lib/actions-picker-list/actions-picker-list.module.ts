import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material';
import { ActionPickerListItem, ActionsPickerListComponent } from './actions-picker-list.component';

// Share the type of items with our users.
export { ActionPickerListItem };

/**
 * A list of action to pick,
 * Used to ask the user to choose a template.
 */
@NgModule({
  declarations: [ActionsPickerListComponent],
  imports: [MatListModule, CommonModule],
  exports: [ActionsPickerListComponent]
})
export class ActionsPickerListModule {}
