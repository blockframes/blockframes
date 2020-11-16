import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Blockframes
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { MediaService } from '@blockframes/media/+state/media.service';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
// File Explorer
import { 
  getCollection,
  getId,
  isHostedMediaForm,
  MediaFormTypes,
  SubDirectoryFile,
  SubDirectoryImage
} from '../../file-explorer.model';

@Component({
  selector: 'file-explorer-single-file-view',
  templateUrl: 'single-file-view.component.html',
  styleUrls: ['./single-file-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleFileViewComponent implements OnInit {

  public activeForm: OrganizationForm | MovieForm;

  @Input() activeDirectory: SubDirectoryImage | SubDirectoryFile;

  constructor(
    private mediaService: MediaService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() { 
    const id = getId(this.activeDirectory.storagePath);
    const collection = getCollection(this.activeDirectory.storagePath);

    if (collection === 'movies') {
      const movie = await this.movieService.getValue(id);
      this.activeForm = new MovieForm(movie);
    } else {
      const org = await this.organizationService.getValue(id);
      this.activeForm = new OrganizationForm(org);
    }

    this.cdr.markForCheck();
  }

  public async update() {
    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.activeForm);
    const id = getId(this.activeDirectory.storagePath);
    const collection = getCollection(this.activeDirectory.storagePath);

    if (collection === 'movies') {
      documentToUpdate.id = id;
      this.movieService.update(documentToUpdate);
    } else if (collection === 'orgs') {
      await this.organizationService.update(id, documentToUpdate);
    }
    this.mediaService.uploadMedias(mediasToUpload);

    if (!mediasToUpload[0].blobOrFile) {
      this.snackBar.open('File deleted', 'close', { duration: 5000 });
    }
  }

  public getSingleMediaForm(): HostedMediaForm {
    const path = this.activeDirectory.storagePath.split('/').pop();
    let form: MediaFormTypes;
    if (!!path) {
      form = path.split('.').reduce((res, key) => res?.controls?.[key], this.activeForm);
    } else {
      form = this.activeForm.controls[this.activeDirectory.fileRefField];
    }
    return isHostedMediaForm(form) ? form : form.controls.ref;
  }

}
