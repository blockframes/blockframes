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

export const ERC1077_BYTECODE = "0x608060405234801561001057600080fd5b506040516020806122588339810180604052602081101561003057600080fd5b810190808051906020019092919050505080806000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060016000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000181905550600180819055506000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f7d958a859734aa5212d2568f8700fe77619bc93d5b08abf1445585bac8bff60660405160405180910390a35050612051806102076000396000f3fe6080604052600436106100df576000357c010000000000000000000000000000000000000000000000000000000090048063775eed681161009c578063a30c8c7511610076578063a30c8c75146109fe578063d9d6298f14610beb578063e0e1855414610c54578063fac750e014610cb9576100df565b8063775eed68146107a757806381dd7b8e14610918578063a2d39bdb1461098b576100df565b806352631ab4146100e15780635e6261fa1461010c578063670d14b21461017f5780636d6330641461021757806370586bb314610400578063724854b014610572575b005b3480156100ed57600080fd5b506100f6610ce4565b6040518082815260200191505060405180910390f35b34801561011857600080fd5b506101656004803603604081101561012f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610cea565b604051808215151515815260200191505060405180910390f35b34801561018b57600080fd5b506101ce600480360360208110156101a257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610d38565b604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390f35b34801561022357600080fd5b506103ea600480360361012081101561023b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561028257600080fd5b82018360208201111561029457600080fd5b803590602001918460018302840111640100000000831117156102b657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803560ff1690602001909291908035906020019064010000000081111561036457600080fd5b82018360208201111561037657600080fd5b8035906020019184600183028401116401000000008311171561039857600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610d7c565b6040518082815260200191505060405180910390f35b34801561040c57600080fd5b5061055c600480360361012081101561042457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561048b57600080fd5b82018360208201111561049d57600080fd5b803590602001918460018302840111640100000000831117156104bf57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803560ff1690602001909291905050506110d2565b6040518082815260200191505060405180910390f35b34801561057e57600080fd5b50610765600480360361014081101561059657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156105fd57600080fd5b82018360208201111561060f57600080fd5b8035906020019184600183028401116401000000008311171561063157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803560ff169060200190929190803590602001906401000000008111156106df57600080fd5b8201836020820111156106f157600080fd5b8035906020019184600183028401116401000000008311171561071357600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061120d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156107b357600080fd5b506108fe600480360360408110156107ca57600080fd5b81019080803590602001906401000000008111156107e757600080fd5b8201836020820111156107f957600080fd5b8035906020019184602083028401116401000000008311171561081b57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561087b57600080fd5b82018360208201111561088d57600080fd5b803590602001918460208302840111640100000000831117156108af57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f82011690508083019250505050505050919291929050505061124a565b604051808215151515815260200191505060405180910390f35b34801561092457600080fd5b506109716004803603604081101561093b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611417565b604051808215151515815260200191505060405180910390f35b34801561099757600080fd5b506109e4600480360360408110156109ae57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506116fb565b604051808215151515815260200191505060405180910390f35b348015610a0a57600080fd5b50610bd16004803603610120811015610a2257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190640100000000811115610a6957600080fd5b820183602082011115610a7b57600080fd5b80359060200191846001830284011164010000000083111715610a9d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803560ff16906020019092919080359060200190640100000000811115610b4b57600080fd5b820183602082011115610b5d57600080fd5b80359060200191846001830284011164010000000083111715610b7f57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611a82565b604051808215151515815260200191505060405180910390f35b348015610bf757600080fd5b50610c3a60048036036020811015610c0e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611aba565b604051808215151515815260200191505060405180910390f35b348015610c6057600080fd5b50610ca360048036036020811015610c7757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611b54565b6040518082815260200191505060405180910390f35b348015610cc557600080fd5b50610cce611b9f565b6040518082815260200191505060405180910390f35b60025481565b6000816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015414905092915050565b60006020528060005260406000206000915090508060000154908060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905082565b600080825114151515610df7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f496e76616c6964207369676e617475726573000000000000000000000000000081525060200191505060405180910390fd5b600060418351811515610e0657fe5b06141515610e7c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f496e76616c6964207369676e617475726573000000000000000000000000000081525060200191505060405180910390fd5b60025487141515610ef5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600d8152602001807f496e76616c6964206e6f6e63650000000000000000000000000000000000000081525060200191505060405180910390fd5b610f068a8a8a8a8a8a8a8a8a611a82565b1515610f7a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f496e76616c6964207369676e617475726500000000000000000000000000000081525060200191505060405180910390fd5b60005a9050606060008c73ffffffffffffffffffffffffffffffffffffffff168c8c6040518082805190602001908083835b602083101515610fd15780518252602082019150602081019050602083039250610fac565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114611033576040519150601f19603f3d011682016040523d82523d6000602084013e611038565b606091505b5080935081925050506000611054308f8f8f8f8f8f8f8f6110d2565b9050811515600254827f30c13bf5d64d4bb93ec9b93f68b635ddc58b81da7e18c8b4fbb5061ceb70cd4160405160405180910390a460026000815480929190600101919050555060006110b05a86611ba590919063ffffffff16565b90506110bd818c8c611bc7565b81955050505050509998505050505050505050565b60008989898980519060200120898989898960028111156110ef57fe5b604051602001808a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166c010000000000000000000000000281526014018973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166c010000000000000000000000000281526014018881526020018781526020018681526020018581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166c0100000000000000000000000002815260140183815260200182815260200199505050505050505050506040516020818303038152906040528051906020012090509998505050505050505050565b600061123a8261122c6112278e8e8e8e8e8e8e8e8e6110d2565b611d58565b611db090919063ffffffff16565b90509a9950505050505050505050565b600080611258336001610cea565b9050808061129157503073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b1515611305576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260178152602001807f53656e646572206e6f74207065726d697373696f6e656400000000000000000081525060200191505060405180910390fd5b8251845114151561137e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f556e657175616c20617267756d656e7420736574206c656e677468730000000081525060200191505060405180910390fd5b60008090505b84518110156113d3576113c5858281518110151561139e57fe5b9060200190602002015185838151811015156113b657fe5b906020019060200201516116fb565b508080600101915050611384565b507f60adf38c13a1938c05e8f58e818ac5a3f74aa8652155df92802c3b64932747ee84516040518082815260200191505060405180910390a1600191505092915050565b600080611425336001610cea565b9050808061145e57503073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156114d2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260178152602001807f53656e646572206e6f74207065726d697373696f6e656400000000000000000081525060200191505060405180910390fd5b826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015414151561158a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600b8152602001807f496e76616c6964206b657900000000000000000000000000000000000000000081525060200191505060405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fe96ba5805e91ce4b5225d90ad1aac15c207472188f51f24025974341360f0f8a60405160405180910390a36000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000808201600090556001820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055505060018060008282540392505081905550600191505092915050565b600080611709336001610cea565b9050808061174257503073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156117b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260178152602001807f53656e646572206e6f74207065726d697373696f6e656400000000000000000081525060200191505060405180910390fd5b8373ffffffffffffffffffffffffffffffffffffffff166000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515156118bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f4b657920616c726561647920616464656400000000000000000000000000000081525060200191505060405180910390fd5b836000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000181905550600180600082825401925050819055506000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f7d958a859734aa5212d2568f8700fe77619bc93d5b08abf1445585bac8bff60660405160405180910390a3600191505092915050565b600080611a9e611a99308d8d8d8d8d8d8d8d6110d2565b611d58565b9050611aaa8382611eb7565b9150509998505050505050505050565b60008073ffffffffffffffffffffffffffffffffffffffff166000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614159050919050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001549050919050565b60015481565b6000828211151515611bb657600080fd5b600082840390508091505092915050565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515611cf95760008190508073ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33611c328688611fe790919063ffffffff16565b6040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b158015611cb757600080fd5b505af1158015611ccb573d6000803e3d6000fd5b505050506040513d6020811015611ce157600080fd5b81019080805190602001909291905050505050611d53565b3373ffffffffffffffffffffffffffffffffffffffff166108fc611d268486611fe790919063ffffffff16565b9081150290604051600060405180830381858888f19350505050158015611d51573d6000803e3d6000fd5b505b505050565b60008160405160200180807f19457468657265756d205369676e6564204d6573736167653a0a333200000000815250601c01828152602001915050604051602081830303815290604052805190602001209050919050565b600060418251141515611dc65760009050611eb1565b60008060006020850151925060408501519150606085015160001a90507f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a082600190041115611e1b5760009350505050611eb1565b601b8160ff1614158015611e335750601c8160ff1614155b15611e445760009350505050611eb1565b60018682858560405160008152602001604052604051808581526020018460ff1660ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015611ea1573d6000803e3d6000fd5b5050506020604051035193505050505b92915050565b60008060418451811515611ec757fe5b049050600080905060008060008060008090505b86811015611fd55780604102602081018b01519350604081018b0151925060ff604182018c01511694505060018985858560405160008152602001604052604051808581526020018460ff1660ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015611f63573d6000803e3d6000fd5b505050602060405103519450611f7885611aba565b1580611fb057508573ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1611155b15611fc5576000975050505050505050611fe1565b8495508080600101915050611edb565b60019750505050505050505b92915050565b600080831415611ffa576000905061201f565b6000828402905082848281151561200d57fe5b0414151561201a57600080fd5b809150505b9291505056fea165627a7a72305820900fe5350aa15906ecd663dac6d90ff657056319a555d757192b38e6d754edc10029";

export const ENS_REGISTRY_ABI = [{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"resolver","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"label","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setSubnodeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"ttl","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"resolver","type":"address"}],"name":"NewResolver","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"ttl","type":"uint64"}],"name":"NewTTL","type":"event"}];

export const ENS_RESOLVER_ABI = [{"constant":true,"inputs":[{"name":"interfaceID","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"key","type":"string"},{"name":"value","type":"string"}],"name":"setText","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"interfaceID","type":"bytes4"}],"name":"interfaceImplementer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentTypes","type":"uint256"}],"name":"ABI","outputs":[{"name":"","type":"uint256"},{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"name":"setPubkey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes"}],"name":"setContenthash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"target","type":"address"},{"name":"isAuthorised","type":"bool"}],"name":"setAuthorisation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"key","type":"string"}],"name":"text","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"name":"setABI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"contenthash","outputs":[{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"pubkey","outputs":[{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"addr","type":"address"}],"name":"setAddr","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"interfaceID","type":"bytes4"},{"name":"implementer","type":"address"}],"name":"setInterface","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"address"},{"name":"","type":"address"}],"name":"authorisations","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_ens","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"target","type":"address"},{"indexed":false,"name":"isAuthorised","type":"bool"}],"name":"AuthorisationChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"indexedKey","type":"string"},{"indexed":false,"name":"key","type":"string"}],"name":"TextChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"x","type":"bytes32"},{"indexed":false,"name":"y","type":"bytes32"}],"name":"PubkeyChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"name","type":"string"}],"name":"NameChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"interfaceID","type":"bytes4"},{"indexed":false,"name":"implementer","type":"address"}],"name":"InterfaceChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes"}],"name":"ContenthashChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"a","type":"address"}],"name":"AddrChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"contentType","type":"uint256"}],"name":"ABIChanged","type":"event"}];