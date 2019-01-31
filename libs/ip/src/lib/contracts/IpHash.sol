pragma solidity >=0.4.22 <0.6.0;

contract IpHash {

    mapping(address => bytes32[]) private scriptsByOwner;
    mapping(bytes32 => address) public scriptsOwner;

    event Timestamp(bytes32 indexed scriptHash, address indexed owner);

    function addIp(bytes32 _hash) public {
        require(scriptsOwner[_hash] == address(0), "Ip has already a owner");
        scriptsOwner[_hash] = msg.sender;
        scriptsByOwner[msg.sender].push(_hash);
        emit Timestamp(_hash, msg.sender);
    }

    function scriptsFrom(address _owner) public view returns (bytes32[] memory) {
        return scriptsByOwner[_owner];
    }
}
