import { ChangeDetectionStrategy, Component, Pipe, PipeTransform } from '@angular/core';

// Blockframes
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';
import { MediaService } from '@blockframes/media/+state/media.service';

// Material
import { MatDialog } from '@angular/material/dialog';

// File Explorer
import { getDirectories, Directory } from './explorer.model';

// RxJs
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryFn } from '@angular/fire/firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';

function back(current: string) {
  return current.split('/').slice(0, -1).join('/');
}

function next(current: string, next: string) {
  return `${current}/${next}`;
}

function getDir(root: Directory, path: string) {
  return path.split('/').reduce((parent, segment) => parent.children[segment], root);
}

/**
 * Create crumbs path based on the current path
 * "titles/:id/poster" -> ["tiles", "titles/:id", "titles/:id/poster"]
 */
export function getCrumbs(path: string) {
  const crumbs = [];
  path.split('/').forEach((segment, i) => {
    const last = crumbs[i - 1] ? `${crumbs[i - 1]}/` : '';
    crumbs.push(`${last}${segment}`);
  });
  return crumbs;
}



@Component({
  selector: 'file-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent {
  root$: Observable<Directory>;
  path$ = new BehaviorSubject<string>('/');
  crumbs$ = this.path$.pipe(map(getCrumbs));

  constructor(
    private orgQuery: OrganizationQuery,
    private movieService: MovieService,
    private routerQuery: RouterQuery
  ) {
    const org = this.orgQuery.getActive();
    const app: App = this.routerQuery.getData('app');

    const query: QueryFn = ref => ref
      .where('orgIds', 'array-contains', org.id)
      .where(`storeConfig.appAccess.${app}`, '==', true);
    this.root$ = this.movieService.valueChanges(query).pipe(
      map(titles => getDirectories(org, titles))
    );
  }

  setPath(path: string) {
    this.path$.next(path);
  }


  // public async openDialog(row?: HostedMediaWithMetadata | MovieNote | string) {

  //   // safe guard
  //   if (this.activeDirectory.type === 'directory') return;

  //   // retrieving useful values
  //   const id = getId(this.activeDirectory.storagePath);
  //   const collection = getCollection(this.activeDirectory.storagePath);

  //   // instantiating corresponding form
  //   let form: OrganizationForm | MovieForm;
  //   if (collection === 'orgs') {
  //     const org = await this.organizationService.getValue(id);
  //     form = new OrganizationForm(org);
  //   } else if (collection === 'movies') {
  //     const movie = await this.movieService.getValue(id);
  //     form = new MovieForm(movie);
  //   } else {
  //     throw new Error(`Unsupported collection ${collection}, only 'orgs' and 'movies' are supported!`);
  //   }

  //   // retrieving the needed media from the form
  //   let mediaForm: MediaFormTypes;
  //   const formList = getFormList(form, this.activeDirectory.storagePath);
  //   if (!!row) {
  //     mediaForm = formList.controls.find(control => {
  //       if (isHostedMediaForm(control)) { // HostedMediaForm

  //         const ref = (row as string);
  //         return control.get('ref').value === ref;

  //       } else if (isHostedMediaWithMetadataForm(control)) { // HostedMediaWithMetadataForm

  //         const title = (row as HostedMediaWithMetadata).title;
  //         return control.get('title').value === title;

  //       } else { // MovieNotesForm

  //         const ref = (row as MovieNote).ref;
  //         return control.get('ref').get('ref').value === ref;
  //       }
  //     });
  //   } else {
  //     mediaForm = formList.add();
  //   }
  //   if (!mediaForm) {
  //     throw new Error(`Media Form not found!`);
  //   }

  //   // opening file/image upload dialog
  //   let dialog: MatDialogRef<FileExplorerUploaderDialogComponent | FileExplorerCropperDialogComponent>;
  //   if (this.activeDirectory.type === 'file') {
  //     dialog = this.dialog.open(FileExplorerUploaderDialogComponent, {
  //       width: '60vw',
  //       data: {
  //         form: mediaForm,
  //         privacy: this.activeDirectory.privacy,
  //         storagePath: this.activeDirectory.storagePath,
  //         acceptedFileType: this.activeDirectory.acceptedFileType
  //       },
  //     });
  //   } else if (this.activeDirectory.type === 'image') {
  //     dialog = this.dialog.open(FileExplorerCropperDialogComponent, {
  //       width: '60vw',
  //       data: {
  //         form: mediaForm,
  //         ratio: this.activeDirectory.ratio,
  //         storagePath: this.activeDirectory.storagePath
  //       },
  //     });
  //   }

  //   // on dialog close update the corresponding document & upload the file if needed
  //   this.dialogSubscription = dialog.afterClosed().subscribe(async result => {
  //     if (!!result) {
  //       if (this.activeDirectory.type === 'directory') return;

  //       const { documentToUpdate, mediasToUpload } = extractMediaFromDocumentBeforeUpdate(form);
  //       if (collection === 'orgs') {
  //         await this.organizationService.update(id, documentToUpdate);
  //       } else if (collection === 'movies') {
  //         documentToUpdate.id = id;
  //         await this.movieService.update(documentToUpdate);
  //       } else {
  //         this.dialogSubscription.unsubscribe();
  //         throw new Error(`Unsupported collection ${collection}, only 'orgs' and 'movies' are supported!`);
  //       }
  //       const mediaIndex = mediasToUpload.findIndex(media => !!media.blobOrFile);
  //       if (mediaIndex > -1) {
  //         // oldRef is not set if it's a new upload and therefore a new file is added
  //         if (!mediasToUpload[mediaIndex].oldRef && typeof this.activeDirectory.hasFile === 'number') {
  //           this.activeDirectory.hasFile++
  //         }
  //       }
  //       this.mediaService.uploadMedias(mediasToUpload);
  //     }
  //     this.dialogSubscription.unsubscribe();
  //   });
  // }

}


@Pipe({ name: 'getDir' })
export class GetDirPipe implements PipeTransform {
  transform(path: string, root: Directory) {
    return getDir(root, path);
  }
}