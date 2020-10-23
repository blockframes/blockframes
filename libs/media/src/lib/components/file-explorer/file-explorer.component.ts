import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { FileDialogComponent } from '../dialog/file/file.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { HostedMediaWithMetadataForm } from '@blockframes/media/form/media-with-metadata.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';
import { MovieService } from '@blockframes/movie/+state';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { FormList } from '@blockframes/utils/form';
import { MediaRatioType } from '../cropper/cropper.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { ImageDialogComponent } from '../dialog/image/image.component';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

type MediaFormList = FormList<(HostedMediaWithMetadataForm | HostedMediaForm)[], HostedMediaWithMetadataForm | HostedMediaForm>

const columns = { 
  ref: 'Type',
  name: 'Document Name',
  download: 'Download',
  edit: 'Edit',
  delete: 'Delete'
};

interface Directory {
  name: string,
  subDirectories: (SubDirectoryImage | SubDirectoryFile)[]
}

interface SubDirectory {
  multiple: boolean,
  name: string,
  docNameField: string,
  fileRefField: string,
  storagePath: string,
  selected?: boolean
}

interface SubDirectoryImage extends SubDirectory {
  type: 'image',
  ratio: MediaRatioType
}

interface SubDirectoryFile extends SubDirectory {
  type: 'file'
}

@Component({
  selector: '[org] file-explorer',
  templateUrl: 'file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent {

  @Input() set org(org: OrganizationDocumentWithDates) {
    this.directories.push({
      name: org.denomination.full,
      subDirectories: [
        {
          name: 'Documents',
          type: 'file',
          multiple: true,
          docNameField: 'title',
          fileRefField: 'ref',
          storagePath: `orgs/${org.id}/documents/notes`,
          selected: true
        },
        {
          name: 'Logo',
          type: 'image',
          ratio: 'square',
          multiple: false,
          docNameField: 'logo',
          fileRefField: 'logo',
          storagePath: `orgs/${org.id}/logo`
        }
      ]
    });
    this.activeDirectory = this.directories[0].subDirectories[0];
    this.orgId = org.id;

    this.org$ = this.organizationService.valueChanges(org.id);
    this.active$ = this.organizationService.valueChanges(org.id);

    this.getTitleDirectories(org);

  };

  private orgId: string;

  // 💀 if org doesnt have document.notes, then nothing is displayed. This issue probably doesn't happen if it's based on a Form
  public org$: Observable<OrganizationDocumentWithDates>;

  public directories: Directory[] = [];
  public columns = columns;
  public initialColumns = Object.keys(columns);

  public active$: Observable<Movie | OrganizationDocumentWithDates>
  public activeDirectory: SubDirectoryImage | SubDirectoryFile;
  private activeForm: OrganizationForm | MovieForm;

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  public async selectDirectory(event: MatSelectionListChange) {
    // needed in order to manage the selected selection list; since there are many lists
    this.activeDirectory.selected = false;
    // needed to re-render the cropper component.
    this.activeForm = undefined;

    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;

    const multiple = (selectedValues as SubDirectoryFile | SubDirectoryImage).multiple;
    const collection = this.getCollection();

    if (collection === 'movies') {
      const id = this.getId()
      if (multiple) {
        this.active$ = this.movieService.valueChanges(id);
      } else {
        const movie = await this.movieService.getValue(id);
        this.activeForm = new MovieForm(movie);
      }
    } else {
      if (multiple) {
        this.active$ = this.organizationService.valueChanges(this.orgId);
      } else {
        const org = await this.organizationService.getValue(this.orgId);
        this.activeForm = new OrganizationForm(org);
      }
    }

    this.activeDirectory.selected = true;
    this.cdr.markForCheck();
  }

  public deleteFile(row: HostedMediaWithMetadata) {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this file?',
        question: ' ',
        buttonName: 'Yes',
        onConfirm: async () => {
          const org = await this.organizationService.getValue(this.orgId);
          const orgForm = new OrganizationForm(org);
          const formList = this.getFormList(orgForm);
          const index = formList.controls.findIndex(form => {
            if (determineFormType(form)) {
              return form.get('title').value === row.title;
            } else {
              return form.get('ref').value === row.ref;
            }
          });

          if (index > -1) {
            formList.removeAt(index);
            const { documentToUpdate } = extractMediaFromDocumentBeforeUpdate(orgForm);
            await this.organizationService.update(this.orgId, documentToUpdate);
          }
        }
      }
    });
  }

  public async openDialog(row?: HostedMediaWithMetadata | string) {

    let formList: MediaFormList;
    let activeForm: OrganizationForm | MovieForm;
    const collection = this.getCollection()
    if (collection === 'orgs') {
      const org = await this.organizationService.getValue(this.orgId);
      activeForm = new OrganizationForm(org);
      formList = this.getFormList(activeForm);
    } else {
      const movie = await this.movieService.getValue(this.getId());
      activeForm = new MovieForm(movie);
      formList = this.getFormList(activeForm)
    }

    let mediaForm: HostedMediaWithMetadataForm | HostedMediaForm;
    if (!!row) {
      mediaForm = formList.controls.find(ctrl => {
        if (determineFormType(ctrl)) {
          const title = typeof(row) === "string" ? row : row.title;
          return ctrl.get('title').value === title;
        } else {
          const ref = typeof(row) === "string" ? row : row.ref;
          return ctrl.get('ref').value === ref;
        }
      })
    } else {
      mediaForm = formList.add();
    }

    let dialog: MatDialogRef<FileDialogComponent | ImageDialogComponent>;
    if (this.activeDirectory.type === 'file') {
      dialog = this.dialog.open(FileDialogComponent, { width: '60vw', data: {
        form: mediaForm,
        privacy: 'protected',
        storagePath: this.activeDirectory.storagePath
      }});
    } else {
      dialog = this.dialog.open(ImageDialogComponent, { width: '60vw', data: {
        form: mediaForm,
        ratio: this.activeDirectory.ratio,
        storagePath: this.activeDirectory.storagePath
      }});
    }

    dialog.afterClosed().subscribe(async result => {
      if (!!result) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(activeForm);
        if (collection === 'orgs') {
          await this.organizationService.update(this.orgId, documentToUpdate);
        } else {
          documentToUpdate.id = this.getId()
          await this.movieService.update(documentToUpdate);
        }
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }

  public async downloadFile(item: Partial<HostedMediaWithMetadata | OrganizationDocumentWithDates>) {
    const ref = item[this.activeDirectory.fileRefField];
    const url = await this.mediaService.generateImgIxUrl(ref);
    window.open(url);
  }

  public async updateImage() {
    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.activeForm);
    
    const collection = this.getCollection();
    if (collection === 'movies') {
      documentToUpdate.id = this.getId();
      this.movieService.update(documentToUpdate);
    } else if (collection === 'orgs') {
      await this.organizationService.update(this.orgId, documentToUpdate);
    }
    this.mediaService.uploadMedias(mediasToUpload);
  }

  private async getTitleDirectories(org: OrganizationDocumentWithDates) {
    const titlesRaw = await this.movieService.getValue(org.movieIds)
    // festival only now - fix it to be dynamic
    const titles = titlesRaw.filter(movie => !!movie).filter(movie => movie.storeConfig.appAccess.festival);

    for (const title of titles) {
      this.directories.push({
        name: title.title.original,
        subDirectories: [
          {
            name: 'Poster',
            type: 'image',
            ratio: 'poster',
            multiple: false,
            docNameField: 'poster',
            fileRefField: 'poster',
            storagePath: `movies/${title.id}/poster`
          },
          {
            name: 'Banner',
            type: 'image',
            ratio: 'banner',
            multiple: false,
            docNameField: 'banner',
            fileRefField: 'banner',
            storagePath: `movies/${title.id}/banner`
          },
          {
            name: 'Still Photo',
            type: 'image',
            multiple: true,
            docNameField: '',
            fileRefField: '',
            ratio: 'still',
            storagePath: `movies/${title.id}/promotional.still_photo`
          }
          // NOTES & STATEMENTS = promotional.notes[].ref
          // PRESENTATION_DECK = promotional.other_links.presentation_deck
          // SALES PITCH = promotional.salesPitch.file
          // SCENARIO = promotional.scenario
          // STILL_PHOTO = promotional.still_photo[]
        ]
      })
    }

    this.cdr.markForCheck();
  }

  public getSingleMediaForm(): HostedMediaForm {
    return this.activeForm.controls[this.activeDirectory.fileRefField];
  }

  /**
   * Derive deep path from storage path
   */
  public getDeepPath() {
    return this.activeDirectory.storagePath.split('/').splice(2).join('.');
  }

  private getId() {
    return this.activeDirectory.storagePath.split('/')[1];
  }

  public getCollection() {
    return this.activeDirectory.storagePath.split('/').shift() as 'movies' | 'orgs';
  }

  public getFileRef(row: HostedMediaWithMetadata | string) {
    return typeof(row) === "string" ? row : row[this.activeDirectory.fileRefField];
  }

  public getTitleRef(row: HostedMediaWithMetadata | string) {
    return typeof(row) === "string" ? row : row[this.activeDirectory.docNameField];
  }

  private getFormList(form: OrganizationForm | MovieForm): MediaFormList {
    return this.getDeepPath().split('.').reduce((res, key) => res?.controls?.[key], form);
  }
}

function determineFormType(form: HostedMediaWithMetadataForm | HostedMediaForm): form is HostedMediaWithMetadataForm {
  return !!(form as HostedMediaWithMetadataForm).get('title');
}
