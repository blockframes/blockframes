import { OrganizationMember, OrganizationOperation, OrganizationAction } from "./organization.model";


const Alice: OrganizationMember = {
  avatar: 'https://fakeimg.pl/300/',
  name: 'Alice',
  uid: '0',
  email: 'alice@test.com',
  roles: [],
  operationIds: ['0', '1'],
};
const Bob: OrganizationMember = {
  avatar: 'https://fakeimg.pl/300/',
  name: 'Bob',
  uid: '1',
  email: 'bob@test.com',
  roles: [],
  operationIds: ['1'],
};
const Charlie: OrganizationMember = {
  avatar: 'https://fakeimg.pl/300/',
  name: 'Charlie',
  uid: '2',
  email: 'charlie@test.com',
  roles: [],
  operationIds: ['1'],
};
const David: OrganizationMember = {
  avatar: 'https://fakeimg.pl/300/',
  name: 'David',
  uid: '3',
  email: 'david@test.com',
  roles: [],
  operationIds: ['0'],
};
export const mockOperations: OrganizationOperation[] = [
  { id: '0', name: 'Signing Delivery',  quorum: 2, members: [Alice, David] },
  { id: '1', name: 'Buying a Film',     quorum: 3, members: [Alice, Bob, Charlie] },
];
export const mockActions: OrganizationAction[] = [
  { id: '0', opid: '0', name: 'Delivery #123',    isApproved: false, signers: [Alice] },
  { id: '1', opid: '0', name: 'Delivery #456',    isApproved: true, signers: [Alice, David], approvalDate: '14/02/19' },
  { id: '2', opid: '0', name: 'Delivery #789',    isApproved: false, signers: [Alice] },
  { id: '3', opid: '1', name: 'Buy Parasite',     isApproved: true, signers: [Alice, Bob, Charlie], approvalDate: '14/02/19' },
  { id: '4', opid: '1', name: 'Buy Harry Potter', isApproved: false, signers: [Alice, Charlie] },
  { id: '5', opid: '1', name: 'Buy Rubber',       isApproved: true, signers: [Alice, Bob, Charlie], approvalDate: '14/02/19' },
  { id: '6', opid: '1', name: 'Buy LotR',         isApproved: true, signers: [Alice, Bob, Charlie], approvalDate: '14/02/19' },
]
export const mockOrgMembers: OrganizationMember[] = [Alice, Bob, Charlie, David];
