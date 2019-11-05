import { Output, EventEmitter } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Movie } from './../../+state/movie.model';
import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BasketService } from 'apps/catalog/marketplace/marketplace/src/app/distribution-right/+state/basket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private basketService: BasketService, private snackbar: MatSnackBar) {}

  public toggle$(movieId: string) {
    return this.basketService.isAddedToWishlist(movieId);
  }

  public addToWishlist(movie: Movie, event: Event) {
    event.stopPropagation();
    this.basketService.updateWishlist(movie);
    this.snackbar.open(`${movie.main.title.international} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist(movie: Movie, event: Event) {
    event.stopPropagation();
    this.basketService.updateWishlist(movie);
    this.snackbar.open(`${movie.main.title.international} has been removed from your selection.`, 'close', { duration: 2000 });
  }
}
