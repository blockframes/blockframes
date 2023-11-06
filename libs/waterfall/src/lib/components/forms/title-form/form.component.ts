// Angular
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

// Blockframes
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { AuthService } from '@blockframes/auth/service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { combineLatest, map, tap } from 'rxjs';


@Component({
  selector: '[movieId] waterfall-title-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleFormComponent implements OnInit {

  @Input() movieForm: MovieForm;
  @Input() movieId = '';
  @Input() createMode: boolean;

  public canEditMovie$

  constructor(
    private authService: AuthService,
    private permissionService: WaterfallPermissionsService,
  ) { }

  ngOnInit() {
    const isWaterfallAdmin$ = this.permissionService.valueChanges(this.authService.profile.orgId, { waterfallId: this.movieId }).pipe(
      map(permission => permission?.isAdmin)
    );

    this.canEditMovie$ = combineLatest([isWaterfallAdmin$, this.authService.isBlockframesAdmin$]).pipe(
      map(([isWaterfallAdmin, isBlockframesAdmin]) => this.createMode || isWaterfallAdmin || isBlockframesAdmin),
      tap(canEditMovie => canEditMovie ? this.movieForm.enable() : this.movieForm.disable())
    );
  }

  addDirector() {
    this.movieForm.directors.add({ firstName: '', lastName: '' });
  }

  removeDirector(index: number) {
    this.movieForm.directors.removeAt(index);
  }
}
