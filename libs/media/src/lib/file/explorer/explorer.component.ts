import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

// Blockframes
import { HostedMediaWithMetadata } from '@blockframes/media/+state/media.firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationDocumentWithDates } from '@blockframes/organization/+state/organization.firestore';
import { fromOrg, MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { MovieNote } from '@blockframes/movie/+state/movie.firestore';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MediaService } from '@blockframes/media/+state/media.service';
import { extractMediaFromDocumentBeforeUpdate } from '@blockframes/media/+state/media.model';
import { sortMovieBy } from '@blockframes/utils/helpers';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// File Explorer
import { FileExplorerCropperDialogComponent } from './cropper-dialog/cropper-dialog.component';
import { FileExplorerUploaderDialogComponent } from './uploader-dialog/uploader-dialog.component';
import {
  createMovieFileStructure,
  createOrgFileStructure,
  Directory,
  getCollection,
  getFormList,
  getId,
  isHostedMediaForm,
  isHostedMediaWithMetadataForm,
  MediaFormTypes,
  SubDirectoryFile,
  SubDirectoryImage
} from './explorer.model';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[org] file-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent implements OnInit, OnDestroy {

  @Input() org: OrganizationDocumentWithDates;

  public directories: Directory[] = [];
  public activeDirectory: Directory | SubDirectoryImage | SubDirectoryFile;

  public breadCrumbs: { name: string, path: number[] }[] = [];

  private dialogSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private mediaService: MediaService,
    private movieService: MovieService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {

    // create org's folders & files
    const orgFileStructure = createOrgFileStructure(this.org);
    this.directories.push(orgFileStructure);

    // set the org folder as active
    this.goTo([0]);

    // create folders & files for every movies of this org
    this.movieService.getValue(fromOrg(this.org.id)).then(titlesRaw => {
      const currentApp: App = this.routerQuery.getData('app');
      const titles = titlesRaw.filter(movie => !!movie).filter(movie => movie.storeConfig.appAccess[currentApp]);
      titles.sort((a, b) => sortMovieBy(a, b, 'Title'));

      titles.forEach((title, index) =>
        this.directories.push(createMovieFileStructure(title, index + 1)) // we do `index + 1` because `[0]` is the org
      );
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!!this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }


  public goTo(path: number[]) {

    const pathCopy = [...path]; // without a copy we would be modifying the path of the parent directory

    let currentDirectory: Directory | SubDirectoryImage | SubDirectoryFile = this.directories[pathCopy.shift()];
    this.breadCrumbs = [{ name: currentDirectory.name, path: currentDirectory.path }];

    pathCopy.forEach(index => {
      if (currentDirectory.type === 'directory') {
        currentDirectory = currentDirectory.directories[index];
        this.breadCrumbs.push({ name: currentDirectory.name, path: currentDirectory.path });
      } else throw new Error('Not able to navigate to this element in breadcrumb');
    });

    this.activeDirectory = currentDirectory;
  }


  public async openDialog(row?: HostedMediaWithMetadata | MovieNote | string) {

    // safe guard
    if (this.activeDirectory.type === 'directory') return;

    // retrieving useful values
    const id = getId(this.activeDirectory.storagePath);
    const collection = getCollection(this.activeDirectory.storagePath);

    // instantiating corresponding form
    let form: OrganizationForm | MovieForm;
    if (collection === 'orgs') {
      const org = await this.organizationService.getValue(id);
      form = new OrganizationForm(org);
    } else if (collection === 'movies') {
      const movie = await this.movieService.getValue(id);
      form = new MovieForm(movie);
    } else {
      throw new Error(`Unsupported collection ${collection}, only 'orgs' and 'movies' are supported!`);
    }

    // retrieving the needed media from the form
    let mediaForm: MediaFormTypes;
    const formList = getFormList(form, this.activeDirectory.storagePath);
    if (!!row) {
      mediaForm = formList.controls.find(control => {
        if (isHostedMediaForm(control)) { // HostedMediaForm

          const ref = (row as string);
          return control.get('ref').value === ref;

        } else if (isHostedMediaWithMetadataForm(control)) { // HostedMediaWithMetadataForm

          const title = (row as HostedMediaWithMetadata).title;
          return control.get('title').value === title;

        } else { // MovieNotesForm

          const ref = (row as MovieNote).ref;
          return control.get('ref').get('ref').value === ref;
        }
      });
    } else {
      mediaForm = formList.add();
    }
    if (!mediaForm) {
      throw new Error(`Media Form not found!`);
    }

    // opening file/image upload dialog
    let dialog: MatDialogRef<FileExplorerUploaderDialogComponent | FileExplorerCropperDialogComponent>;
    if (this.activeDirectory.type === 'file') {
      dialog = this.dialog.open(FileExplorerUploaderDialogComponent, {
        width: '60vw',
        data: {
          form: mediaForm,
          privacy: this.activeDirectory.privacy,
          storagePath: this.activeDirectory.storagePath,
          acceptedFileType: this.activeDirectory.acceptedFileType
        },
      });
    } else if (this.activeDirectory.type === 'image') {
      dialog = this.dialog.open(FileExplorerCropperDialogComponent, {
        width: '60vw',
        data: {
          form: mediaForm,
          ratio: this.activeDirectory.ratio,
          storagePath: this.activeDirectory.storagePath
        },
      });
    }

    // on dialog close update the corresponding document & upload the file if needed
    this.dialogSubscription = dialog.afterClosed().subscribe(async result => {
      if (!!result) {
        if (this.activeDirectory.type === 'directory') return;

        const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(form);
        if (collection === 'orgs') {
          await this.organizationService.update(id, documentToUpdate);
        } else if (collection === 'movies') {
          documentToUpdate.id = id;
          await this.movieService.update(documentToUpdate);
        } else {
          this.dialogSubscription.unsubscribe();
          throw new Error(`Unsupported collection ${collection}, only 'orgs' and 'movies' are supported!`);
        }
        const mediaIndex = mediasToUpload.findIndex(media => !!media.blobOrFile);
        if (mediaIndex > -1) {
          // oldRef is not set if it's a new upload and therefore a new file is added
          if (!mediasToUpload[mediaIndex].oldRef && typeof this.activeDirectory.hasFile === 'number') {
            this.activeDirectory.hasFile++
          }
        }
        this.mediaService.uploadMedias(mediasToUpload);
      }
      this.dialogSubscription.unsubscribe();
    });
  }

}
