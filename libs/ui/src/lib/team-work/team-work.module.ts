import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamWorkFiltersComponent } from './team-work-filters/team-work-filters.component';
import { TeamWorkActionsComponent } from './team-work-actions/team-work-actions.component';
import { MatMenuModule, MatIconModule, MatDividerModule, MatButtonModule } from '@angular/material';


@NgModule({
  declarations: [TeamWorkFiltersComponent, TeamWorkActionsComponent,],
  imports: [CommonModule, MatMenuModule, MatIconModule, MatDividerModule, MatButtonModule],
  exports: [TeamWorkFiltersComponent, TeamWorkActionsComponent,]
})
export class TeamWorkModule {}
