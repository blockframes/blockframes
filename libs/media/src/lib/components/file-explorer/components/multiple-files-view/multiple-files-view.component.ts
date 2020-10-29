import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
// Blockframes
import { extractMediaFromDocumentBeforeUpdate, MediaService } from '@blockframes/media/+state';
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { MovieNote } from '@blockframes/movie/+state/movie.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';
// Material
import { MatDialog } from '@angular/material/dialog';
// File explorer
import { 
  getCollection,
  getFormList,
  getId,
  isHostedMediaForm,
  isHostedMediaWithMetadataForm,
  SubDirectoryFile,
  SubDirectoryImage,
  getDeepPath
} from '../../file-explorer.model';

const columns = { 
  ref: 'Type',
  name: 'Document Name',
  actions: 'Actions'
};

@Component({
  selector: 'file-explorer-multiple-files-view',
  templateUrl: 'multiple-files-view.component.html',
  styleUrls: ['./multiple-files-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleFilesViewComponent implements OnInit {

  public getDeepPath = getDeepPath

  public active$: Observable<Movie | OrganizationDocumentWithDates>

  public columns = columns;
  public initialColumns = Object.keys(columns);

  @Input() activeDirectory: SubDirectoryImage | SubDirectoryFile;

  @Output() editFile: EventEmitter<HostedMediaWithMetadata | MovieNote | string> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
  ) { }

  ngOnInit() {
    const collection = getCollection(this.activeDirectory.storagePath);
    const id = getId(this.activeDirectory.storagePath);

    if (collection === 'movies') {
      this.active$ = this.movieService.valueChanges(id);
    } else {
      this.active$ = this.organizationService.valueChanges(id);
    }
  }

  public deleteFile(row: HostedMediaWithMetadata | MovieNote | string) {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          const collection = getCollection(this.activeDirectory.storagePath);
          const id = getId(this.activeDirectory.storagePath);

          let form: OrganizationForm | MovieForm;
          if (collection === 'movies') {
            const movie = await this.movieService.getValue(id);
            form = new MovieForm(movie);
          } else {
            const org = await this.organizationService.getValue(id);
            form = new OrganizationForm(org);
          }
          const formList = getFormList(form, this.activeDirectory.storagePath);

          const index = formList.controls.findIndex(ctrl => {
            if (isHostedMediaForm(ctrl)) {
              const ref = (row as string);
              return ctrl.get('ref').value === ref;
            } else if (isHostedMediaWithMetadataForm(ctrl)) {
              const title = (row as HostedMediaWithMetadata).title;
              return ctrl.get('title').value === title;
            } else {
              const ref = (row as MovieNote).ref;
              return ctrl.get('ref').get('ref').value === ref;
            }
          });

          if (index > -1) {
            formList.removeAt(index);
            const { documentToUpdate } = extractMediaFromDocumentBeforeUpdate(form);
            if (collection === 'movies') {
              documentToUpdate.id = id;
              await this.movieService.update(id, documentToUpdate);
            } else {
              await this.organizationService.update(id, documentToUpdate);
            }
          }
        }
      }
    });
  }

  public async downloadFile(item: Partial<HostedMediaWithMetadata | OrganizationDocumentWithDates>) {
    const ref = item[this.activeDirectory.fileRefField];
    const url = await this.mediaService.generateImgIxUrl(ref);
    window.open(url);
  }

  public getFileRef(row: HostedMediaWithMetadata | MovieNote | string) {
    return typeof(row) === "string" ? row : row[this.activeDirectory.fileRefField];
  }

  public getTitleRef(row: HostedMediaWithMetadata | MovieNote | string) {
    return typeof(row) === "string" ? row : row[this.activeDirectory.docNameField];
  }
}
