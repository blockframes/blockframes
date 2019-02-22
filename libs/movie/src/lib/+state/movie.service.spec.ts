import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { MovieStore } from './movie.store';

describe('MovieService', () => {
  let movieService: MovieService;
  let movieStore: MovieStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovieService, MovieStore],
      imports: [ HttpClientTestingModule ]
    });

    movieService = TestBed.get(MovieService);
    movieStore = TestBed.get(MovieStore);
  });

  it('should be created', () => {
    expect(movieService).toBeDefined();
  });

});
