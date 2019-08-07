import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActionPickerItem, ActionsPickerComponent } from './actions-picker.component';
import { MatRadioModule } from '@angular/material';
import { FlexModule } from '@angular/flex-layout';

// Share the type of items with our users.
export { ActionPickerItem };

/**
 * A list of action to pick,
 * Used to ask the user to choose a template.
 */
@NgModule({
  declarations: [ActionsPickerComponent],
  imports: [MatListModule, MatIconModule, RouterModule, CommonModule, MatRadioModule, FlexModule],
  exports: [ActionsPickerComponent]
})
export class ActionsPickerModule {}
