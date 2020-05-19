import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state';
import { Subscription } from 'rxjs';
import { UnloadComponent, UploadState } from '@blockframes/ui/upload/unload.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'catalog-title-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleUploadComponent implements OnInit, OnDestroy, UnloadComponent {

  public allowUnload = true;
  public accept = ['.mp4', '.webm'];
  public types = ['video/mp4', 'video/webm'];
  public uploadPath: string;

  private subscription: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    private snackBar: MatSnackBar,
  ) {}

    ngOnInit() {
      this.subscription = this.movieQuery.selectActiveId().subscribe(id => {
        this.uploadPath = `movies/${id}/hostedVideo`
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }

    uploadState(state: UploadState) {
      if (state === 'uploading') {
        this.allowUnload = false;
      } else {
        this.allowUnload = true;
      }
    }

    /**
     * This function will be called by the `unload.guard.ts` to check if it canDeactivate
     */
    canUnload() {
      if (!this.allowUnload) {
        this.snackBar.open('You cannot leave while uploading, cancel upload first', 'close')
      }
      return this.allowUnload;
    }
}
