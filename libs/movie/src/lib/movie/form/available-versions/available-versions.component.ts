// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-available-versions',
  templateUrl: 'available-versions.component.html',
  styleUrls: ['./available-versions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormAvailableVersionsComponent {
  public form = this.shell.getForm('movie');

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Available Versions');
  }

}
