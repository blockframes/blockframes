import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FileUploaderService } from '@blockframes/media/+state/file-uploader.service';
import { getFileStoragePath } from '@blockframes/media/+state/static-files';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesPitchComponent implements OnInit, OnDestroy {
  movieId = this.route.snapshot.params.movieId;
  form = this.shell.getForm('movie');

  private sub: Subscription;

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private uploaderService: FileUploaderService,
  ) {
    this.dynTitle.setPageTitle('Sales Pitch')
  }

  get salesPitch() {
    return this.form.promotional.get('salesPitch');
  }

  ngOnInit() {
    this.sub = this.salesPitch.get('description').valueChanges.subscribe(description => {
      const storagePath = getFileStoragePath('movies', 'salesPitch', this.movieId)
      const task = this.uploaderService.retrieveFromQueue(storagePath);
      if (!!task) {
        task.metadata.description = description;
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
