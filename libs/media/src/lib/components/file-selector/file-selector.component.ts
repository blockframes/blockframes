
import { ChangeDetectionStrategy, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';

import { fromOrg, Movie, MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { recursivelyListFiles } from '@blockframes/media/+state/media.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ViewerDialogComponent } from '../dialog/file-viewer/viewer.component';

@Component({
  selector: 'media-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectorComponent implements OnInit, OnDestroy {

  orgFiles: { path: string, isSelected: boolean }[];
  movies: Movie[];
  moviesFiles: Record<string, { path: string, isSelected: boolean }[]>;
  selectedFiles: string[];

  private sub: Subscription;

  constructor(
    private orgQuery: OrganizationQuery,
    private movieService: MovieService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FileSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { selectedFiles: string[] }
  ) { }

  async ngOnInit() {
    this.selectedFiles = this.data.selectedFiles ?? [];

    const org = this.orgQuery.getActive();
    this.orgFiles = recursivelyListFiles(org).map(file => ({ path: file, isSelected: this.selectedFiles.includes(file) }));
    this.movies = await this.movieService.getValue(fromOrg(org.id))
    this.moviesFiles = {};
    this.movies.forEach(movie =>
      this.moviesFiles[movie.id] = recursivelyListFiles(movie).map(file =>
        ({ path: file, isSelected: this.selectedFiles.includes(file) })));

    // we set disableClose to `true` on the dialog, so we have to fake the exits events
    this.sub = this.dialogRef.backdropClick().subscribe(() => this.closeDialog()); // user click outside of the dialog
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // simulate closing dialog on Escape key pressed
  @HostListener('window:keyup', ['$event'])
  escapeHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.closeDialog();
    }
  }

  toggleSelect(event: MouseEvent, file: string) {
    event.preventDefault();
    event.stopPropagation();
    for (const orgFile of this.orgFiles) {
      if (orgFile.path === file) {

        orgFile.isSelected = !orgFile.isSelected;

        if (orgFile.isSelected) {
          this.selectedFiles.push(file);
        } else {
          const newSelectedFiles = this.selectedFiles.filter(selected => selected !== file);
          this.selectedFiles = newSelectedFiles;
        }
        return; // avoid further iterations

      }
    }

    for (const movieId in this.moviesFiles) {
      for (const movieFile of this.moviesFiles[movieId]) {

        if (movieFile.path === file) {

          movieFile.isSelected = !movieFile.isSelected;

          if (movieFile.isSelected) {
            this.selectedFiles.push(file);
          } else {
            const newSelectedFiles = this.selectedFiles.filter(selected => selected !== file);
            this.selectedFiles = newSelectedFiles;
          }
          return; // avoid further iterations
        }

      }
    }
  }

  previewFile(ref: string) {
    this.dialog.open(ViewerDialogComponent, { data: { ref }, width: '70vw', height: '70vh' })
  }

  closeDialog() {
    // remove the event handler to avoid having it triggered elsewhere in the app
    this.dialogRef.close(this.selectedFiles);
  }

}
