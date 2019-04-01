export const ERC1077_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'lastNonce',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_key', type: 'address' }, { name: '_purpose', type: 'uint256' }],
    name: 'keyHasPurpose',
    outputs: [{ name: 'result', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'keys',
    outputs: [{ name: 'purpose', type: 'uint256' }, { name: 'key', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'nonce', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'gasLimit', type: 'uint256' },
      { name: 'operationType', type: 'uint8' },
      { name: 'signatures', type: 'bytes' }
    ],
    name: 'executeSigned',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'nonce', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'gasLimit', type: 'uint256' },
      { name: 'operationType', type: 'uint8' }
    ],
    name: 'calculateMessageHash',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'pure',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'nonce', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'gasLimit', type: 'uint256' },
      { name: 'operationType', type: 'uint8' },
      { name: 'signatures', type: 'bytes' }
    ],
    name: 'getSigner',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'pure',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_keys', type: 'address[]' }, { name: '_purposes', type: 'uint256[]' }],
    name: 'addKeys',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_key', type: 'address' }, { name: '_purpose', type: 'uint256' }],
    name: 'removeKey',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_key', type: 'address' }, { name: '_purpose', type: 'uint256' }],
    name: 'addKey',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'nonce', type: 'uint256' },
      { name: 'gasPrice', type: 'uint256' },
      { name: 'gasToken', type: 'address' },
      { name: 'gasLimit', type: 'uint256' },
      { name: 'operationType', type: 'uint8' },
      { name: 'signatures', type: 'bytes' }
    ],
    name: 'canExecute',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_key', type: 'address' }],
    name: 'keyExist',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_key', type: 'address' }],
    name: 'getKeyPurpose',
    outputs: [{ name: 'purpose', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'keyCount',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_key', type: 'address' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'messageHash', type: 'bytes32' },
      { indexed: true, name: 'nonce', type: 'uint256' },
      { indexed: true, name: 'success', type: 'bool' }
    ],
    name: 'ExecutedSigned',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: 'count', type: 'uint256' }],
    name: 'MultipleKeysAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'key', type: 'address' },
      { indexed: true, name: 'purpose', type: 'uint256' }
    ],
    name: 'KeyAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'key', type: 'address' },
      { indexed: true, name: 'purpose', type: 'uint256' }
    ],
    name: 'KeyRemoved',
    type: 'event'
  }
];
