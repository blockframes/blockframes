import { AttendeeStatus, MeetingMediaControl } from "@blockframes/event/+state/event.firestore";
import { StorageFile } from "@blockframes/media/+state/media.firestore";
import { MovieDocument, MoviePromotionalElements } from '@blockframes/data-model';
import { StoreStatus } from "@blockframes/utils/static-model";

export interface OldStoreConfig {
  appAccess: {
    catalog: boolean,
    festival: boolean,
    financiers?: boolean
  },
  status: StoreStatus,
  storeType: string
}

export interface OldMeeting {
  organizerUid: string;
  description: string;
  attendees: Record<string, AttendeeStatus>;
  files: string[];
  selectedFile: string;
  controls: Record<string, MeetingMediaControl>
}

interface OldOtherLink {
  name: string;
  url: string;
}

interface OldMoviePromotionalElements extends MoviePromotionalElements {
  financialDetails: StorageFile,
  clip_link: string,
  promo_reel_link: string,
  screener_link: string,
  teaser_link: string,
  trailer_link: string,
  other_links: OldOtherLink[]
}

export interface OldMovieDocument extends MovieDocument {
  promotional: OldMoviePromotionalElements
}