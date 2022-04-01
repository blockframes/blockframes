import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { fromOrg, MovieService } from '@blockframes/movie/+state/movie.service';
import { StorageFile, recursivelyListFiles, Movie } from '@blockframes/shared/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FilePreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'file-picker',
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerComponent implements OnInit, OnDestroy {
  orgFiles: { file: StorageFile; isSelected: boolean }[];
  movies: Movie[];
  moviesFiles: Record<string, { file: StorageFile; isSelected: boolean }[]>;
  selectedFiles: StorageFile[];

  private sub: Subscription;

  constructor(
    private orgService: OrganizationService,
    private movieService: MovieService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FilePickerComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: { selectedFiles: StorageFile[] }
  ) {}

  async ngOnInit() {
    this.selectedFiles = this.data.selectedFiles ?? [];

    const org = this.orgService.org;
    this.orgFiles = recursivelyListFiles(org).map(file => ({
      file,
      isSelected: this.selectedFiles.some(selectedFile => selectedFile.storagePath === file.storagePath),
    }));
    this.movies = await this.movieService.getValue(fromOrg(org.id));
    this.moviesFiles = {};
    this.movies.forEach(
      movie =>
        (this.moviesFiles[movie.id] = recursivelyListFiles(movie)
          .filter(file => !!file.storagePath)
          .map(file => ({
            file,
            isSelected: this.selectedFiles.some(selectedFile => selectedFile.storagePath === file.storagePath),
          })))
    );

    this.cdr.markForCheck();

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

  toggleSelect(event: MouseEvent, file: StorageFile) {
    event.preventDefault();
    event.stopPropagation();
    for (const orgFile of this.orgFiles) {
      if (orgFile.file.storagePath === file.storagePath) {
        orgFile.isSelected = !orgFile.isSelected;

        if (orgFile.isSelected) {
          this.selectedFiles.push(file);
        } else {
          const newSelectedFiles = this.selectedFiles.filter(selected => selected.storagePath !== file.storagePath);
          this.selectedFiles = newSelectedFiles;
        }
        return; // avoid further iterations
      }
    }

    for (const movieId in this.moviesFiles) {
      for (const movieFile of this.moviesFiles[movieId]) {
        if (movieFile.file.storagePath === file.storagePath) {
          movieFile.isSelected = !movieFile.isSelected;

          if (movieFile.isSelected) {
            this.selectedFiles.push(file);
          } else {
            const newSelectedFiles = this.selectedFiles.filter(selected => selected.storagePath !== file.storagePath);
            this.selectedFiles = newSelectedFiles;
          }
          return; // avoid further iterations
        }
      }
    }
  }

  previewFile(ref: StorageFile) {
    this.dialog.open(FilePreviewComponent, {
      data: { ref },
      width: '70vw',
      height: '70vh',
      autoFocus: false,
    });
  }

  closeDialog() {
    // remove the event handler to avoid having it triggered elsewhere in the app
    this.dialogRef.close(this.selectedFiles);
  }
}
