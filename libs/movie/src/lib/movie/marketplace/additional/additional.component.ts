import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Movie } from '@blockframes/shared/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { TitleMarketplaceShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalComponent implements OnInit {
  public movie$ = this.shell.movie$;
  public status: Record<string, Movie['productionStatus'][]> = {
    finished: ['finished', 'released'],
  };
  public keys = {
    additional: ['estimatedBudget', 'originalRelease', 'boxOffice', 'rating', 'certifications'],
    formats: ['format', 'formatQuality', 'color', 'soundFormat'],
  };

  constructor(private shell: TitleMarketplaceShellComponent, private dynTitle: DynamicTitleService) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Film Page', 'Addition Information');
  }
}
