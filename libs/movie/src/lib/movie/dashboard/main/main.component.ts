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

  public form = this.shell.form;

  constructor(private dynTitle: DynamicTitleService, private shell: DashboardTitleShellComponent) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Main Information');
  }

}
