import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';
import { MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { MovieNote } from '@blockframes/movie/+state/movie.firestore';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';

// Material
import { MatSelectionListChange } from '@angular/material/list';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// File Explorer
import { ImageDialogComponent } from '../dialog/image/image.component';
import { FileDialogComponent } from '../dialog/file/file.component';
import { 
  Directory,
  getCollection,
  getFormList,
  getId,
  isHostedMediaForm,
  isHostedMediaWithMetadataForm,
  MediaFormList,
  MediaFormTypes,
  SubDirectoryFile,
  SubDirectoryImage
} from './file-explorer.model';


const directoryColumns = {
  name: 'Name'
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

    this.org$ = this.organizationService.valueChanges(org.id);

    this.getTitleDirectories(org);
  };

  // 💀 if org doesnt have document.notes, then nothing is displayed. This issue probably doesn't happen if it's based on a Form - but forms dont update
  public org$: Observable<OrganizationDocumentWithDates>;

  public directories: Directory[] = [];

  public directoryColumns = directoryColumns;
  public initialDirectoryColumns = Object.keys(directoryColumns);

  public activeDirectory: Directory | SubDirectoryImage | SubDirectoryFile

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
  }

  public async selectSubDirectory(name: string) {
    if (this.activeDirectory.type === 'directory') {
      this.activeDirectory = this.activeDirectory.directories.find(directory => directory.name === name);
    }

    this.breadCrumbs.push({ name: this.activeDirectory.name, path: this.activeDirectory.path });
  }

  public async selectDirectory(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;

    this.breadCrumbs = [{ name: this.activeDirectory.name, path: this.activeDirectory.path }];
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

  public async openDialog(row?: HostedMediaWithMetadata | MovieNote | string) {    
    if (this.activeDirectory.type === 'directory') return;
    
    let form: OrganizationForm | MovieForm;
    const id = getId(this.activeDirectory.storagePath);
    const collection = getCollection(this.activeDirectory.storagePath);

    if (collection === 'orgs') {
      const org = await this.organizationService.getValue(id);
      form = new OrganizationForm(org);
    } else {
      const movie = await this.movieService.getValue(id);
      form = new MovieForm(movie);
    }
    const formList = getFormList(form, this.activeDirectory.storagePath);

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
        privacy: this.activeDirectory.privacy,
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
        if (this.activeDirectory.type === 'directory') return;
        const id = getId(this.activeDirectory.storagePath);
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(form);
        if (collection === 'orgs') {
          await this.organizationService.update(id, documentToUpdate);
        } else {
          documentToUpdate.id = id;
          await this.movieService.update(documentToUpdate);
        }
        this.mediaService.uploadMedias(mediasToUpload);
      }
    });
  }

}
