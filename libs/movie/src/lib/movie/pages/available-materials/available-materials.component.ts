import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { MovieVersionInfoForm } from '@blockframes/movie/form/version-info/version-info.form';

@Component({
  selector: 'movie-form-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormAvailableMaterialscComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) {}

  public getPath(segment: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${segment}`;
  }

  get versionInfo() {
    return this.form.get('versionInfo') as MovieVersionInfoForm;
  }

  get hasKeys() {
    return Object.keys(this.versionInfo.controls).length;
  }

}
