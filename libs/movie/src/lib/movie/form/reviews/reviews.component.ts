import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { premiereType } from '@blockframes/utils/static-model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';

@Component({
  selector: 'movie-form-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormReviewscComponent {
  form = this.shell.getForm('movie');
  toggleChanged: boolean;
  public premieres = Object.keys(premiereType);

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Selection & Reviews');
  }

  onChange() {
    this.toggleChanged = true;
  }

  onClick(group: MatButtonToggleGroup) {
    if (!this.toggleChanged) group.value = null;
    this.toggleChanged = false;
  }
}
