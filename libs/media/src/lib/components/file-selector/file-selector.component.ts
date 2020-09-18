
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationDocumentWithDates, OrganizationQuery } from '@blockframes/organization/+state';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { recursivelyListFiles } from '@blockframes/media/+state/media.model';

@Component({
  selector: '[form] media-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectorComponent implements OnInit {

  public org$: Observable<OrganizationDocumentWithDates>;
  public movies$: Observable<Movie[]>;
  public movieFiles$ = new BehaviorSubject<string[]>(null);
  public selectedFile$: Observable<string>;

  @Input() form: FormControl;

  @ViewChild('fileSelector') fileSelector: MatExpansionPanel;

  constructor(
    private orgQuery: OrganizationQuery,
    private movieService: MovieService,
  ) { }

  ngOnInit() {
    this.selectedFile$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map(value => typeof value === 'string' ? value : ''),
    );
    this.org$ = this.orgQuery.selectActive();
    this.movies$ = this.org$.pipe(
      switchMap(org => this.movieService.valueChanges(org.movieIds)),
    );
  }

  async getFilesOfMovie(movie: Movie) {
    const files = recursivelyListFiles(movie);
    this.movieFiles$.next(files);
  }

  clearFiles() {
    this.movieFiles$.next(null);
  }

  select(file: string) {
    this.form.setValue(file);
    this.fileSelector.close();
  }

}
