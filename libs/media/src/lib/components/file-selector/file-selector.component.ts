
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { storage } from 'firebase';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationDocumentWithDates, OrganizationQuery } from '@blockframes/organization/+state';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';

async function recursivelyListFiles(refs: storage.Reference[]): Promise<storage.Reference[]> {

  const filesPromises = refs.map(async ref => {
    const result = await ref.listAll();
    const childResults = await recursivelyListFiles(result.prefixes);
    return [...result.items, ...childResults];
  });
  const files = await Promise.all(filesPromises);

  // pre-ES2019 Array flattening, with ES2019 we could use Array.prototype.flat()
  return [].concat(...files);
}

@Component({
  selector: '[form] media-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectorComponent implements OnInit {

  public org$: Observable<OrganizationDocumentWithDates>;
  public movies$: Observable<Movie[]>;
  public movieFiles$ = new BehaviorSubject<storage.Reference[]>(null);
  public selectedFile$: Observable<string>;

  @Input() form: FormControl;

  @ViewChild('fileSelector') fileSelector: MatExpansionPanel;

  constructor(
    private orgQuery: OrganizationQuery,
    private movieService: MovieService,
    private storageService: AngularFireStorage,
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

  async getFilesOfMovie(movieId: string) {

    // TODO update this with the new file architecture
    const storageRef = `movies/${movieId}`;

    const movieRef = this.storageService.storage.ref(storageRef);
    const files = await recursivelyListFiles([movieRef]);

    this.movieFiles$.next(files);
  }

  clearFiles() {
    this.movieFiles$.next(null);
  }

  select(file: storage.Reference) {
    this.form.setValue(file.fullPath);
    this.fileSelector.close();
  }

}
