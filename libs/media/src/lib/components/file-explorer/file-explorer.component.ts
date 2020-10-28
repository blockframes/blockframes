import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { extractMediaFromDocumentBeforeUpdate, isMediaForm } from '@blockframes/media/+state/media.model';
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
import { MovieForm, MovieNotesForm } from '@blockframes/movie/form/movie.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { ImageDialogComponent } from '../dialog/image/image.component';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { MovieNote } from '@blockframes/movie/+state/movie.firestore';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

type MediaFormTypes = HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm
type MediaFormList = FormList<(HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm)[], HostedMediaWithMetadataForm | HostedMediaForm | MovieNotesForm>

const columns = { 
  ref: 'Type',
  name: 'Document Name',
  actions: 'Actions'
};

const directoryColumns = {
  name: 'Name'
}

interface DirectoryBase {
  name: string;
  path: number[];
}

interface FileDirectoryBase {
  multiple: boolean;
  docNameField: string;
  fileRefField: string;
  storagePath: string;
  privacy: Privacy;
}

interface Directory extends DirectoryBase {
  type: 'directory';
  collection?: 'movies' | 'orgs';
  selected?: boolean;
  directories: (Directory | SubDirectoryImage | SubDirectoryFile)[];
}

interface SubDirectoryImage extends DirectoryBase, FileDirectoryBase {
  type: 'image';
  ratio: MediaRatioType;
}

interface SubDirectoryFile extends DirectoryBase, FileDirectoryBase {
  type: 'file';
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
      type: 'directory',
      collection: 'orgs',
      selected: true,
      path: [0],
      directories: [
        {
          name: 'Documents',
          type: 'file',
          multiple: true,
          docNameField: 'title',
          fileRefField: 'ref',
          storagePath: `orgs/${org.id}/documents/notes`,
          privacy: 'protected',
          path: [0,0]
        },
        {
          name: 'Logo',
          type: 'image',
          ratio: 'square',
          multiple: false,
          docNameField: 'logo',
          fileRefField: 'logo',
          storagePath: `orgs/${org.id}/logo`,
          privacy: 'public',
          path: [0,1]
        }
      ]
    });
    this.activeDirectory = this.directories[0];
    this.breadCrumbs.push({name: this.activeDirectory.name, path: this.activeDirectory.path});
    this.orgId = org.id;

    this.org$ = this.organizationService.valueChanges(org.id);

    this.getTitleDirectories(org);
  };

  private orgId: string;

  // 💀 if org doesnt have document.notes, then nothing is displayed. This issue probably doesn't happen if it's based on a Form - but forms dont update
  public org$: Observable<OrganizationDocumentWithDates>;

  public directories: Directory[] = [];
  public columns = columns;
  public initialColumns = Object.keys(columns);

  public directoryColumns = directoryColumns;
  public initialDirectoryColumns = Object.keys(directoryColumns);

  public active$: Observable<Movie | OrganizationDocumentWithDates>
  public activeDirectory: Directory | SubDirectoryImage | SubDirectoryFile
  public activeForm: OrganizationForm | MovieForm;

  public breadCrumbs: { name: string, path: number[] }[] = [];

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private routerQuery: RouterQuery
  ) {}

  public goToCrumb(path: number[]) {
    let currentDirectory: Directory | SubDirectoryImage | SubDirectoryFile = this.directories[path[0]];

    this.breadCrumbs = [{ name: currentDirectory.name, path: currentDirectory.path}];

    for (const element of Object.assign([], path).splice(1)) {
      if (currentDirectory.type === 'directory') {
        currentDirectory = currentDirectory.directories[element];
        this.breadCrumbs.push({ name: currentDirectory.name, path: currentDirectory.path });
      } else throw new Error('Not able to navigate to this element in breadcrumb');
    }
    this.activeDirectory = currentDirectory;
    this.cdr.markForCheck();
  }

  public async selectSubDirectory(name: string) {

    if (this.activeDirectory.type === 'directory') {
      this.activeDirectory = this.activeDirectory.directories.find(directory => directory.name === name);
    }

    const collection = this.getCollection();
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      if (this.activeDirectory.multiple) {
        if (collection === 'movies') {
          const id = this.getId();
          this.active$ = this.movieService.valueChanges(id);
        } else {
          this.active$ = this.organizationService.valueChanges(this.orgId);
        }
      } else {
        if (collection === 'movies') {
          const id = this.getId();
          const movie = await this.movieService.getValue(id);
          this.activeForm = new MovieForm(movie);
        } else {
          const org = await this.organizationService.getValue(this.orgId);
          this.activeForm = new OrganizationForm(org);
        }
      }
    }

    this.breadCrumbs.push({ name: this.activeDirectory.name, path: this.activeDirectory.path });
    this.cdr.markForCheck();
  }

  public async selectDirectory(event: MatSelectionListChange) {
    // needed to re-render the cropper component.
    this.activeForm = undefined;

    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;

    this.breadCrumbs = [{ name: this.activeDirectory.name, path: this.activeDirectory.path }];

    if (this.activeDirectory.type === 'directory') return;

    const multiple = (selectedValues as SubDirectoryFile | SubDirectoryImage).multiple;
    const collection = this.getCollection();

    if (collection === 'movies') {
      const id = this.getId();
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
            await this.organizationService.update(this.orgId, documentToUpdate);
          }
        }
      }
    });
  }

  public async openDialog(row?: HostedMediaWithMetadata | MovieNote | string) {

    let formList: MediaFormList;
    const collection = this.getCollection();
    if (collection === 'orgs') {
      const org = await this.organizationService.getValue(this.orgId);
      this.activeForm = new OrganizationForm(org);
      formList = this.getFormList(this.activeForm);
    } else {
      const movie = await this.movieService.getValue(this.getId());
      this.activeForm = new MovieForm(movie);
      formList = this.getFormList(this.activeForm);
    }

    let mediaForm: MediaFormTypes;
    if (!!row) {
      mediaForm = formList.controls.find(ctrl => {
        if (isHostedMediaForm(ctrl)) {
          // HostedMediaForm
          const ref = (row as string);
          return ctrl.get('ref').value === ref;
        } else if (isHostedMediaWithMetadataForm(ctrl)) {
          // HostedMediaWithMetadataForm
          const title = (row as HostedMediaWithMetadata).title;
          return ctrl.get('title').value === title;
        } else {
          // MovieNotesForm
          const ref = (row as MovieNote).ref;
          return ctrl.get('ref').get('ref').value === ref;
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
    } else if (this.activeDirectory.type === 'image') {
      dialog = this.dialog.open(ImageDialogComponent, { width: '60vw', data: {
        form: mediaForm,
        ratio: this.activeDirectory.ratio,
        storagePath: this.activeDirectory.storagePath
      }});
    }

    dialog.afterClosed().subscribe(async result => {
      if (!!result) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.activeForm);
        if (collection === 'orgs') {
          await this.organizationService.update(this.orgId, documentToUpdate);
        } else {
          documentToUpdate.id = this.getId();
          await this.movieService.update(documentToUpdate);
        }
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }

  public async downloadFile(item: Partial<HostedMediaWithMetadata | OrganizationDocumentWithDates>) {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      const ref = item[this.activeDirectory.fileRefField];
      const url = await this.mediaService.generateImgIxUrl(ref);
      window.open(url);
    }
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
    const titlesRaw = await this.movieService.getValue(org.movieIds);
    const currentApp: App = this.routerQuery.getData('app');
    const titles = titlesRaw.filter(movie => !!movie).filter(movie => movie.storeConfig.appAccess[currentApp]);

    let indexCounter = this.directories.length;

    for (const title of titles) {
      this.directories.push({
        name: title.title.original,
        type: 'directory',
        collection: 'movies',
        path: [indexCounter],
        directories: [
          {
            name: 'Main information',
            type: 'directory',
            path: [indexCounter, 0],
            directories: [
              {
                name: 'Poster',
                type: 'image',
                ratio: 'poster',
                multiple: false,
                docNameField: 'poster',
                fileRefField: 'poster',
                storagePath: `movies/${title.id}/poster`,
                privacy: 'public',
                path: [indexCounter, 0, 0],
              },
              {
                name: 'Banner',
                type: 'image',
                ratio: 'banner',
                multiple: false,
                docNameField: 'banner',
                fileRefField: 'banner',
                storagePath: `movies/${title.id}/banner`,
                privacy: 'public',
                path: [indexCounter, 0, 1],
              },
            ]
          },
          {
            name: 'Promotional Elements',
            type: 'directory',
            path: [indexCounter, 1],
            directories: [
              {
                name: 'Presentation Deck',
                type: 'file',
                multiple: false,
                docNameField: 'presentation_deck',
                fileRefField: 'presentation_deck',
                storagePath: `movies/${title.id}/promotional.presentation_deck`,
                privacy: 'public',
                path: [indexCounter, 1, 0],
              },
              {
                name: 'Scenario',
                type: 'file',
                multiple: false,
                docNameField: 'scenario',
                fileRefField: 'scenario',
                storagePath: `movies/${title.id}/promotional.scenario`,
                privacy: 'public',
                path: [indexCounter, 1, 1],
              },
              {
                name: 'Moodboard / Artistic Deck',
                type: 'file',
                multiple: false,
                docNameField: 'file',
                fileRefField: 'file',
                storagePath: `movies/${title.id}/promotional.moodboard`,
                privacy: 'public',
                path: [indexCounter, 1, 2],
              },
              {
                name: 'Still Photo',
                type: 'image',
                multiple: true,
                docNameField: '',
                fileRefField: '',
                ratio: 'still',
                storagePath: `movies/${title.id}/promotional.still_photo`,
                privacy: 'public',
                path: [indexCounter, 1, 3],
              },
            ]
          },
          {
            name: 'Notes & Statements',
            type: 'file',
            multiple: true,
            docNameField: 'ref',
            fileRefField: 'ref',
            storagePath: `movies/${title.id}/promotional.notes`,
            privacy: 'protected',
            path: [indexCounter, 2],
          }
        ]
      })
      indexCounter++
    }
    this.cdr.markForCheck();
  }

  public getSingleMediaForm(): HostedMediaForm {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      const path = this.activeDirectory.storagePath.split('/').pop();
      let form: MediaFormTypes;
      if (!!path) {
        form = path.split('.').reduce((res, key) => res?.controls?.[key], this.activeForm);
      } else {
        // probably possible to remove fileRefField
        form = this.activeForm.controls[this.activeDirectory.fileRefField];
      }
      return isHostedMediaForm(form) ? form : form.controls.ref;
    }
  }

  /**
   * Derive deep path from storage path
   */
  public getDeepPath() {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      return this.activeDirectory.storagePath.split('/').splice(2).join('.');
    }
  }

  private getId() {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      return this.activeDirectory.storagePath.split('/')[1];
    }
  }

  public getCollection() {
    const index = this.activeDirectory.path[0];
    return this.directories[index].collection;
  }

  public getFileRef(row: HostedMediaWithMetadata | string) {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      return typeof(row) === "string" ? row : row[this.activeDirectory.fileRefField];
    }
  }

  public getTitleRef(row: HostedMediaWithMetadata | string) {
    if (this.activeDirectory.type === 'file' || this.activeDirectory.type === 'image') {
      return typeof(row) === "string" ? row : row[this.activeDirectory.docNameField];
    }
  }

  private getFormList(form: OrganizationForm | MovieForm): MediaFormList {
    return this.getDeepPath().split('.').reduce((res, key) => res?.controls?.[key], form);
  }
}

function isHostedMediaForm(form: MediaFormTypes): form is HostedMediaForm {
  return isMediaForm(form);
}

function isHostedMediaWithMetadataForm(form: MovieNotesForm | HostedMediaWithMetadataForm): form is HostedMediaWithMetadataForm {
  return !!(form as HostedMediaWithMetadataForm).get('title');
}
