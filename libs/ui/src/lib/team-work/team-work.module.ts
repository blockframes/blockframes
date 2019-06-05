import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamWorkFiltersComponent } from './team-work-filters/team-work-filters.component';
import { TeamWorkActionsComponent } from './team-work-actions/team-work-actions.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [TeamWorkFiltersComponent, TeamWorkActionsComponent,],
  imports: [CommonModule, MatMenuModule, MatIconModule, MatDividerModule, MatButtonModule],
  exports: [TeamWorkFiltersComponent, TeamWorkActionsComponent,]
})
export class TeamWorkModule {}
