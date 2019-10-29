import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ActionsListComponent } from './actions-list.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActionItem } from './actions-list.component';
import { MatButtonModule } from '@angular/material';

// Share the type of items with our users.
export { ActionItem };

/**
 * A list of action items,
 * Used to ask the user for an such as whether to create or find an organization,
 * or the kind of delivery they want to create.
 */
@NgModule({
  declarations: [ActionsListComponent],
  imports: [MatListModule, MatIconModule, MatButtonModule, RouterModule, CommonModule],
  exports: [ActionsListComponent]
})
export class ActionsListModule {}
