import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieFormShellComponent } from '@blockframes/movie/form/shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'campaign-form-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormBudgetComponent implements OnInit {
  storagePath: string;
  form = this.shell.getForm('campaign');

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) { 
    this.dynTitle.setPageTitle('Estimated budget')
  }

  ngOnInit() {
    const { movieId } = this.route.snapshot.params;
    this.storagePath = `campaigns/${movieId}/files.budget/`;
  }

  get budget() {
    return this.form.get('budget');
  }
}
