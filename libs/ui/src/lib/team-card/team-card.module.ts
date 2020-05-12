// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { TeamCardComponent } from './team-card.component';

// Blockframes
import { ImageReferenceModule } from '../media';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, ImageReferenceModule],
  declarations: [TeamCardComponent],
  exports: [TeamCardComponent]
})
export class TeamCardModule { }
