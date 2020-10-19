import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { SocialGoal, socialGoals } from '@blockframes/utils/static-model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesPitchComponent {
  form = this.shell.getForm('movie');
  public staticGoals = Object.keys(socialGoals) as SocialGoal[];

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Sales Pitch')
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.sales_pitch/`;
  }

  get salesPitch() {
    return this.form.promotional.get('salesPitch');
  }

  get audience() {
    return this.form.get('audience');
  }
}
