import { CrewRolesSlug, ProducerRolesSlug, LegalRolesSlug, TerritoriesSlug, SubLicensorRoleSlug } from "@blockframes/utils/static-model/types";
import { Location } from "./utility";


//////////////////////////
// VARIOUS IDENTITY OBJECTS
// Inclusive & LGBT compatible model
// Even a company can identify as a human!
//////////////////////////

/**
 * @dev Root object of any Person (physical, legal etc..)
 * Not exported and should not be used outside of this file
 */
interface IdentityRaw {
  orgId?: string,

  displayName?: string,

  showName?: boolean,

  /**
   * @see extending interface for enums
   * can be used for various usages: credit role, stakeholder role (for contracts)
   */
  role?: string,
}

/**
 * @dev Represents an human beeing with no specific purpose
 * Use a more representative interface entity (like Credit, SalesAgent) instead of this one if possible
 */
export interface Person extends IdentityRaw {
  firstName?: string,
  lastName?: string,
  avatar?: string,
}

export type StakeholderRaw = IdentityRaw;

export interface Stakeholder extends StakeholderRaw {
  logo?: string;
  countries?: TerritoriesSlug[],
}


/**
 * @dev interface to represent a movie credit
 */
export interface Credit extends Person {
  description?: string,
  filmography?: Filmography[],
  status?: string,
};

export interface Filmography {
  title?: string,
  year?: number | null,
}

/**
 * @dev interface to represent a producer credit
 */
export interface Producer extends Credit {
  role: ProducerRolesSlug, // overrided role scope from Producer interface
};

/**
 * @dev interface to represent a director credit
 */
export interface Director extends Credit {
  category?: string,
};

/**
 * @dev type to represent a cast credit
 */
export type Cast = Credit;

/**
 * @dev interface to represent a crew credit
 */
export interface Crew extends Credit {
  role: CrewRolesSlug, // overrided role scope from Crew interface
};

/**
 * @dev interface to represent an entity within contracts
 */
export interface Party extends StakeholderRaw {
  role: LegalRolesSlug | SubLicensorRoleSlug, // overrided role scope from Person interface
  address?: Location
}

// This is just for more readable code :

export type SalesAgent = Stakeholder;


///////////////////
// CREATE FUNCTIONS
///////////////////

export function createStakeholder(params: Partial<Stakeholder> = {}): Stakeholder {
  return {
    orgId: '',
    countries: [],
    ...params,
    logo: params.logo ?? '',
  }
}

export function createParty(params: Partial<Party> = {}): Party {
  return {
    orgId: '',
    role: 'undefined',
    showName: false,
    ...params,
  }
}

export function createCredit(params: Partial<Credit> = {}) {
  return {
    firstName: '',
    lastName: '',
    role: '',
    filmography: [],
    description: '',
    status: '',
    category: '',
    avatar: '',
    ...params
  }
}

export function createFilmography(params: Partial<Filmography> = {}): Filmography {
  return {
    title: '',
    ...params
  }
}
