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

  public deleteFile(row: HostedMediaWithMetadata) {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          // TODO this only supports org files currently - also no MovieNote and string as input to this method

          const id = getId(this.activeDirectory.storagePath);
          const org = await this.organizationService.getValue(id);
          const orgForm = new OrganizationForm(org);
          const formList = getFormList(orgForm, this.activeDirectory.storagePath);
          const index = formList.controls.findIndex(form => {
            if (isHostedMediaForm(form)) {
              return form.get('ref').value === row.ref;
            } else if (isHostedMediaWithMetadataForm(form)) {
              return form.get('title').value === row.title;
            } else {
              return form.get('ref').get('ref').value === row.ref;
            }
          });

          if (index > -1) {
            formList.removeAt(index);
            const { documentToUpdate } = extractMediaFromDocumentBeforeUpdate(orgForm);
            await this.organizationService.update(id, documentToUpdate);
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
