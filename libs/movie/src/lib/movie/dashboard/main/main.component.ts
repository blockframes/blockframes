// Angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewMainComponent implements OnInit {

  public form = this.shell.getForm('movie');

  constructor(private dynTitle: DynamicTitleService, private shell: DashboardTitleShellComponent) { }

  ngOnInit() {
    const titleName = this.shell.movie?.title?.international || 'No title';
    this.dynTitle.setPageTitle(titleName, 'Main Information');
  }

}
