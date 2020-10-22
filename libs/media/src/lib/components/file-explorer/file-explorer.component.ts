import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { createMovie, Movie } from '@blockframes/movie/+state/movie.model';
import { FormList } from '@blockframes/utils/form';
import { MediaRatioType } from '../cropper/cropper.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';

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

    this.getTitleDirectories(org);

    this.titles$ = this.movieService.valueChanges(org.movieIds).pipe(
      map(movies => movies.filter(movie => !!movie)),
      // festival only now - fix it to be dynamic
      map(movies => movies.filter(movie => movie.storeConfig.appAccess.festival)),
    )
  };

  private orgId: string;

  // 💀 if org doesnt have document.notes, then nothing is displayed. This issue probably doesn't happen if it's based on a Form
  public org$: Observable<OrganizationDocumentWithDates>;
  public titles$: Observable<Movie[]>;

  public directories: Directory[] = [];
  public activeDirectory: SubDirectoryImage | SubDirectoryFile;
  public columns = columns;
  public initialColumns = Object.keys(columns);

  public singleFileForm: OrganizationForm | MovieForm;

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
    this.singleFileForm = undefined;


    const selected = event.source.selectedOptions.selected;
    const [ selectedValues ] = selected.map(x => x.value);
    this.activeDirectory = selectedValues;

    if (!(selectedValues as SubDirectoryFile | SubDirectoryImage).multiple) {
      const collection = this.getCollection();
      if (collection === 'movies') {
        const id = this.getId();
        const movie = await this.movieService.getValue(id);
        this.singleFileForm = new MovieForm(movie);
      } else if (collection === 'orgs') {
        const org = await this.organizationService.getValue(this.orgId);
        this.singleFileForm = new OrganizationForm(org);
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

  public async openDialog(row?: HostedMediaWithMetadata) {
    const org = await this.organizationService.getValue(this.orgId);
    const orgForm = new OrganizationForm(org);
    const formList = this.getFormList(orgForm);

    let mediaForm: HostedMediaWithMetadataForm | HostedMediaForm;
    if (!!row) {
      mediaForm = formList.controls.find(ctrl => {
        if (determineFormType(ctrl)) {
          return ctrl.get('title').value === row.title;
        } else {
          return ctrl.get('ref').value === row.ref;
        }
      })
    } else {
      mediaForm = formList.add();
    }

    const dialog = this.dialog.open(FileDialogComponent, { width: '60vw', data: {
      form: mediaForm,
      privacy: 'protected',
      storagePath: this.activeDirectory.storagePath
    }});

    dialog.afterClosed().subscribe(async result => {
      if (!!result) {
        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(orgForm);
        await this.organizationService.update(this.orgId, documentToUpdate);
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
    const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(this.singleFileForm);
    console.log('doc to update: ', documentToUpdate);
    
    const collection = this.getCollection();
    if (collection === 'movies') {
      const id = this.getId()
      console.log('to movie id: ', id);
      const movie = createMovie(documentToUpdate);
      console.log('movie: ', movie);
      delete movie.id;
      this.movieService.update(id, movie)
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
          }
        ]
      })
    }

    this.cdr.markForCheck();
  }

  public getSingleMediaForm(): HostedMediaForm {
    return this.singleFileForm.controls[this.activeDirectory.fileRefField];
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

  private getCollection() {
    return this.activeDirectory.storagePath.split('/').shift() as 'movies' | 'orgs';
  }

  private getFormList(form: OrganizationForm | MovieForm): FormList<(HostedMediaWithMetadataForm | HostedMediaForm)[], HostedMediaWithMetadataForm | HostedMediaForm> {
    return this.getDeepPath().split('.').reduce((res, key) => res?.controls?.[key], form);
  }
}

function determineFormType(form: HostedMediaWithMetadataForm | HostedMediaForm): form is HostedMediaWithMetadataForm {
  return !!(form as HostedMediaWithMetadataForm).get('title');
}
