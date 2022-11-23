import { ChangeDetectionStrategy, Component, ViewChild, TemplateRef, Pipe, PipeTransform, Input, AfterViewInit, OnInit, Inject } from '@angular/core';
import { where, updateDoc, DocumentReference } from 'firebase/firestore';
import { FirestoreService } from 'ngfire';

// Blockframes
import { MovieService } from '@blockframes/movie/service';
import { createStorageFile, Organization, App, getAllAppsExcept } from '@blockframes/model';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { getFileMetadata } from '@blockframes/media/utils';
import { APP } from '@blockframes/utils/routes/utils';
import { ActivatedRoute } from "@angular/router";

// File Explorer
import { getDirectories, Directory, FileDirectory } from './explorer.model';

// RxJs
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

function getDir(root: Directory, path: string) {
  return path.split('/').reduce((parent, segment) => parent?.children[segment] ?? parent, root);
}

/**
 * Create crumbs path based on the current path
 * "titles/:id/poster" -> ["tiles", "titles/:id", "titles/:id/poster"]
 */
function getCrumbs(path: string) {
  const crumbs = [];
  path.split('/').filter(v => !!v).forEach((segment, i) => {
    const previous = crumbs[i - 1] ? `${crumbs[i - 1]}/` : '';
    crumbs.push(`${previous}${segment}`);
  });
  return crumbs;
}

@Component({
  selector: 'file-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent implements OnInit, AfterViewInit {
  root$: Observable<Directory>;
  path$ = new BehaviorSubject<string>('org');
  crumbs$ = this.path$.pipe(map(getCrumbs));
  templates: Record<string, TemplateRef<unknown>> = {};

  org$ = new BehaviorSubject<Organization>(undefined);
  @Input()
  set org(org: Organization) {
    this.org$.next(org);
  }
  get org() {
    return this.org$.getValue();
  }

  @ViewChild('image') image?: TemplateRef<unknown>;
  @ViewChild('file') file?: TemplateRef<unknown>;
  @ViewChild('fileList') fileList?: TemplateRef<unknown>;
  @ViewChild('imageList') imageList?: TemplateRef<unknown>;
  @ViewChild('directory') directory?: TemplateRef<unknown>;

  constructor(
    private movieService: MovieService,
    private firestore: FirestoreService,
    private service: FileUploaderService,
    private route: ActivatedRoute,
    @Inject(APP) private app: App
  ) { }

  ngOnInit() {
    const query = [where('orgIds', 'array-contains', this.org.id)];

    if (this.app !== 'crm') {
      query.push(where(`app.${this.app}.access`, '==', true));
    }

    const apps = this.app === 'crm' ? getAllAppsExcept(['crm']) : [this.app];

    const { directory } = this.route.snapshot.queryParams;
    if (directory) this.next(directory);

    const titles$ = this.movieService.valueChanges(query).pipe(
      map(titles => titles.filter(t => apps.some(app => t.app[app]?.status !== 'archived'))),
      map(titles => titles.sort((movieA, movieB) => movieA.title.international < movieB.title.international ? -1 : 1)),
    );

    this.root$ = combineLatest([
      this.org$.asObservable(),
      titles$
    ]).pipe(
      map(([org, titles]) => getDirectories(org, titles, this.app))
    );
  }

  ngAfterViewInit() {
    this.templates = {
      image: this.image,
      file: this.file,
      directory: this.directory,
      imageList: this.imageList,
      fileList: this.fileList
    }
  }

  keepOrder = () => 0;

  setPath(path: string) {
    this.path$.next(path);
  }

  next(next: string) {
    this.path$.next(`${this.path$.getValue()}/${next}`);
  }

  previous(crumbs: string) {
    this.path$.next(crumbs[crumbs.length - 2]);
  }

  update(file?: FileDirectory) {
    if (file?.togglePrivacy) {
      const metadata = getFileMetadata(file.meta[0], file.meta[1], file.meta[2]);
      const ref = this.firestore.getRef(`${metadata.collection}/${metadata.docId}`) as DocumentReference;
      updateDoc(ref, { [`${metadata.field}.privacy`]: file.form.get('privacy').value });
    }

    this.service.upload();
  }

  change($event: 'removed' | 'added', meta) {
    if ($event === 'removed') {
      const metadata = getFileMetadata(meta[0], meta[1], meta[2])
      const emptyStorageFile = {};
      emptyStorageFile[metadata.field] = createStorageFile({
        collection: null,
        docId: null,
        field: null,
        privacy: null,
        storagePath: null
      });
      const ref = this.firestore.getRef(`${metadata.collection}/${metadata.docId}`) as DocumentReference;
      updateDoc(ref, emptyStorageFile);
    }
  }
}

@Pipe({ name: 'getDir' })
export class GetDirPipe implements PipeTransform {
  transform(path: string, root: Directory) {
    return getDir(root, path);
  }
}
