
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { recursivelyListFiles } from '@blockframes/media/+state/media.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: '[form] media-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectorComponent implements OnInit {

  orgFiles: string[];
  movies: Movie[];
  moviesFiles: Record<string, string[]>;
  selectedFiles: string[];

  escapeHandler = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      this.closeDialog();
    }
  }

  constructor(
    private orgQuery: OrganizationQuery,
    private movieService: MovieService,
    private dialogRef: MatDialogRef<FileSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { selectedFiles: string[] }
  ) { }

  async ngOnInit() {
    this.selectedFiles = this.data.selectedFiles ?? [];

    const org = this.orgQuery.getActive();
    this.orgFiles = recursivelyListFiles(org);
    this.movies = await this.movieService.getValue(org.movieIds);
    this.moviesFiles = {};
    this.movies.forEach(movie => this.moviesFiles[movie.id] = recursivelyListFiles(movie));

    // we set disableClose to `true` on the dialog, so we have to fake the exits events
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog()); // user click outside of the dialog
    window.addEventListener('keyup', this.escapeHandler); // user press the escape key
  }

  isSelected(file: string) {
    return this.selectedFiles.some(selected => selected === file);
  }

  select(file: string) {
    this.selectedFiles.push(file);
  }

  unSelect(file: string) {
    const newSelectedFiles = this.selectedFiles.filter(selected => selected !== file);
    this.selectedFiles = newSelectedFiles;
  }

  closeDialog() {
    // remove the event handler to avoid having it triggered elsewhere in the app
    window.removeEventListener('keyup', this.escapeHandler);
    this.dialogRef.close(this.selectedFiles);
  }

}
