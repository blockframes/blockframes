import { ImgRef, createImgRef } from "../image-uploader";
import { StakeholderRolesSlug, LegalRolesSlug, TerritoriesSlug, ProducerRolesSlug, CastRolesSlug, CrewRolesSlug } from "@blockframes/movie/movie/static-model/types";
import { Location } from "@blockframes/organization/+state/organization.firestore";


//////////////////////////
// VARIOUS IDENTIY OBJECTS
// @dev [WIP] Inclusive & LGBT compatible model
// right now even a company can identify as a human! @TODO (#1388)
//////////////////////////

/**
 * @dev Root object of any Person (physical, legal etc..)
 * Not exported and should not be used outside of this file
 */
interface IdentityRaw {
  orgId?: string,

  displayName?: string, // @todo #1052 for persons, use firstname lastname, display name otherwise

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
  avatar?: ImgRef,
}

export type StakeholderRaw = IdentityRaw;

export interface Stakeholder extends StakeholderRaw {
  role?: StakeholderRolesSlug, // overrided role scope from Person interface
  logo?: ImgRef;
  countries?: TerritoriesSlug[],
}

/**
 * @dev interface to represent a movie credit
 */
export interface Credit extends Person {
  shortBiography?: string,
};

/**
 * @dev interface to represent a producer credit
 */
export interface Producer extends Credit {
  role: ProducerRolesSlug, // overrided role scope from Producer interface
};

/**
 * @dev interface to represent a cast credit
 */
export interface Cast extends Credit {
  role: CastRolesSlug, // overrided role scope from Cast interface
};

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
  role: LegalRolesSlug, // overrided role scope from Person interface
  address?: Location
}

// This is just for more readable code :

export type SalesAgent = Person;

export type Company = Stakeholder;

export type Licensee = Stakeholder;

export type Licensor = Stakeholder;


///////////////////
// CREATE FUNCTIONS
///////////////////

export function createStakeholder(params: Partial<Stakeholder> = {}): Stakeholder {
  return {
    orgId: '',
    logo: createImgRef(),
    ...params,
  }
}

export function createParty(params: Partial<Party> = {}): Party {
  return {
    orgId: '',
    role: null as any, // @todo(#1607) remove as any
    showName: false,
    ...params,
  }
}

export function createCredit(params: Partial<Credit> = {}): Credit {
  return {
    firstName: '',
    lastName: '',
    role: '',
    shortBiography: '',
    avatar: createImgRef(),
    ...params
  };
}

export function createProducer(params: Partial<Credit> = {}): Producer {
  return createCredit(params) as Producer;
}

export function createCrew(params: Partial<Credit> = {}): Crew {
  return createCredit(params) as Crew;
}

export function createCast(params: Partial<Credit> = {}): Cast {
  return createCredit(params) as Cast;
}