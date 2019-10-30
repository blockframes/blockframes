import { Output, EventEmitter } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Movie } from './../../+state/movie.model';
import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: '[movies] movie-display-list',
  templateUrl: './display-list.component.html',
  styleUrls: ['./display-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayListComponent {
  public displayedColumns: string[] = ['picture', 'title', 'director', 'productionYear', 'action'];
  public dataSource: MatTableDataSource<Movie>;

  @Input()
  set movies(movies: Movie[]) {
    this.dataSource = new MatTableDataSource(movies);
  }

  @Output() navigate = new EventEmitter<string>();
}
