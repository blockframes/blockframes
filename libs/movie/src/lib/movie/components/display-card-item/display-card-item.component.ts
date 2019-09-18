import { MovieMain } from './../../+state/movie.model';
import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

@Component({
  selector: '[movie] movie-display-card-item',
  template: `
    <mat-card test-id="content" page-id="display-card">
      <img mat-card-image [src]="movie.poster" alt="Movie's poster" />
      <mat-card-content>
        <mat-card-title-group>
          <mat-card-title test-id="movie-card-title">{{ movie.title.original }}</mat-card-title>
          <mat-card-subtitle *ngFor="let director of movie.directors">
          {{ director.firstName }} {{ director.lastName }}
          </mat-card-subtitle>
        </mat-card-title-group>

        <span>Production Year</span><span>{{ movie.productionYear }}</span>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayCardItemComponent {
  @Input() movie: MovieMain;
  @HostBinding('attr.page-id') pageId = 'display-card';
}
