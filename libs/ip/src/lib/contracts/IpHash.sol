pragma solidity >=0.4.22 <0.6.0;

contract IpHash {

    mapping(address => bytes32[]) private scriptsByOwner;
    mapping(bytes32 => address) public scriptsOwner;

    function addIp(bytes32 _hash) public {
        require(scriptsOwner[_hash] == address(0), "Ip has already a owner");
        scriptsOwner[_hash] = msg.sender;
        scriptsByOwner[msg.sender].push(_hash);
    }

    function scriptsFrom(address _owner) public view returns (bytes32[] memory) {
        return scriptsByOwner[_owner];
    }
}
