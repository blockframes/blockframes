
pragma solidity ^0.5.9;

import "./ERC1077.sol";

// ! WARNING : THE CONTRACT IS ALMOST TOO BIG, ADDING 10 LINES WILL CAUSE DEPLOY THROUGH ETHERS TO FAIL BECAUSE OF "414 URI TOO LONG" EXCEPTION
contract Organization {

    /// @dev Operations are general things like "signing a delivery", "adding a material", etc...
    /// we define whitelist and quorum at the operation level,
    /// that means that a user who is authorized to sign deliveries will be able to sign every deliveries of this org
    /// the quorum is the minimal number of user that needs to give their approval
    struct Operation {
        string name; // operation name : i.e. 'signDelivery'
        uint256 whitelistLength;
        mapping(address => bool) whitelist; // user authorized to approve a given action
        uint256 quorum; // number of user that needs to approve one action
        bool active; // an admin can deactivate/activate an operation
    }

    /// @dev Actions are specific operations, like "sign the delivery #123",
    /// an action contains a tx ("to, value, data" fields), this tx will be triggered if the action is approve by the org
    /// to get approve by the org an action needs to be approve by N whitelisted user, where N >= quorum
    struct Action {
        uint256 operationId; // example : '1 could be signDelivery'
        mapping(address => bool) approvals; // list of user that have already approved this action (prevent double approval)
        uint256 approvalsCount; // count of current approvals for this action (needs to reach quorum to succeed)
        bool active; // an admin can deactivate/activate a pending action
        bool executed; // flag to prevent an action of being exeucted twice

        // tx to trigger in case of success (the action itself)
        address payable to; // TODO maybe this should be move at the op lvl ???
        uint256 value;
        bytes data;
    }

    /// @dev A normal user is stored at the operation level
    /// a normal user can :
    /// - approve an action under this operation (if action doesn't exists yet, it will be created)

    /// @dev Admin are special users stored at the org level,
    /// admins can :
    /// - add/remove admins
    /// - create/delete operations
    /// - add/remove a user from an operation's whitelist
    /// - modify an operation's quorum
    /// - do everything a normal user can do
    uint256 private adminCount;
    mapping(address => bool) private adminList; // list of admins

    /// @dev Main storage of the contract
    mapping(uint256 => Operation) private operations; // list of existing operations
    mapping(bytes32 => Action) private actions; // list of pending actions

    //-----------------------------
    //           EVENTS          //
    //-----------------------------
    event OperationCreated(uint256 indexed operationId);
    event MemberAdded(uint256 indexed operationId, address indexed member);
    event MemberRemoved(uint256 indexed operationId, address indexed member);
    event QuorumUpdated(uint256 indexed operationId, uint256 indexed newQuorum);
    event ActionApproved(bytes32 indexed actionId, address indexed member);
    event ActionExecuted(bytes32 indexed actionId, bool indexed success, bytes data);
    event AdminAdded(address indexed newAdmin);
    event AdminRemoved(address indexed newAdmin);
    event RecoverMember(address indexed member);
    event AdminWithdraw(address indexed admin, uint256 indexed amount);

    //-----------------------------
    //         MODIFIERS         //
    //-----------------------------
    modifier onlyAuthorizedUser(uint256 operationId, bytes32 hash) {
        require(
          operations[operationId].whitelist[msg.sender] || adminList[msg.sender],
          "You are not whitelisted for this operation"
        );
        require(!actions[hash].approvals[msg.sender], "You have already given your approval to this action"); // cannot approve twice
        _;
    }
    modifier userNotAuthorized(uint operationId, address user) {
        require(!isWhitelisted(user, operationId), "This user is already whitelisted for this operation");
        _;
    }
    modifier onlyAdmin() {
        require(adminList[msg.sender], "You are not an Admin");
        _;
    }
    modifier canRemoveAdmin() {
        require(adminCount >= 2, "You cannot remove the last Admin"); // adminCount >= 2 because this check happens before removing one admin
        _;
    }
    modifier operationShouldExists(uint256 operationId) {
        require(operationExists(operationId), "This operation does not exists");
        _;
    }
    modifier operationShouldNotExists(uint256 operationId) {
        require(!operationExists(operationId), "There is already an operation with this ID");
        _;
    }
    modifier operationIsActive(uint256 operationId) {
        require(operations[operationId].active, "This operation has been deactivated");
        _;
    }
    modifier operationIsNotActive(uint256 operationId) {
        require(!operations[operationId].active, "This operation is already active");
        _;
    }
    modifier canRemoveUser(uint256 operationId) {
        require(
            operations[operationId].whitelistLength > operations[operationId].quorum,
            "Whitelist length cannot become inferior to the quorum"
        );
        _;
    }
    modifier canModifyQuorum(uint256 operationId, uint256 newQuorum) {
        require(newQuorum > 0, "Quorum cannot be inferior to one");
        require(
            newQuorum <= operations[operationId].whitelistLength,
            "Quorum cannot become superior to the whitelist length"
        );
        _;
    }
    modifier actionShouldExists(bytes32 hash) {
        require(actionExists(hash), "This action does not exists");
        _;
    }
    modifier actionIsActive(bytes32 hash) {
        require(operations[actions[hash].operationId].active, "This operation has been deactivated");
        require(actions[hash].active, "This action has been deactivated");
        _;
    }
    modifier actionIsNotActive(bytes32 hash) {
        require(!actions[hash].active, "This action is already active");
        _;
    }
    modifier actionNotExecuted(bytes32 hash) {
        require(!actions[hash].executed, "This action has already been executed");
        _;
    }
    modifier actionShouldHavReachedQuorum(bytes32 hash) {
        require(
            actions[hash].approvalsCount >= operations[actions[hash].operationId].quorum || adminList[msg.sender], // action has reach quorum or sender is admin // TODO does Admins can do that ???
            "This action as not yet reached its quorum"
        );
        _;
    }

    //-----------------------------
    //   CONSTRUCTOR / FALLBACK  //
    //-----------------------------

    /// @dev Simply add msg.sender as the first admin
    constructor(address admin) public {
        adminCount++;
        adminList[admin] = true;

        // hardcoded operation(s)
        operations[1].name = 'Signing Delivery';
        operations[1].quorum = 0;
        operations[1].active = true;
        operations[1].whitelistLength = 0;
    }

    /// @dev in case someone want to lock ether in the organization's contract
    /// ether could be withdrawed later by an admin
    function() external payable {}


    //-----------------------------
    //         MAIN FUNCTIONS    //
    //-----------------------------

    /// @dev Approve function : will add one approval to a given action,
    /// if the action does not exist it will be created,
    /// and if the current approval let the action reach its quorum, then the action tx will be triggered
    function approve(
        bytes32 hash, uint256 operationId, address payable to, uint256 value, bytes calldata data
    ) external operationShouldExists(operationId) operationIsActive(operationId) onlyAuthorizedUser(operationId, hash) {

        require(to != address(0x0), "You cannot use the 0x0 address as a destination"); // because we check actionExists() on the 0x0 address

        // if action doesn't exists create it
        if(!actionExists(hash)) {
            actions[hash] = Action(operationId, 0, true, false, to, value, data);
        }

        // same as "actionIsActive", cannot be perform by modifier because the action could have been created just above
        require(actions[hash].active, "This action has been deactivated");

        // increment action approvals
        actions[hash].approvalsCount++;
        actions[hash].approvals[msg.sender] = true;

        emit ActionApproved(hash, msg.sender);

        // if action has reach quorum, execute it
        if (actions[hash].approvalsCount >= operations[actions[hash].operationId].quorum) {
            executeAction(hash);
        }
    }

    /// @dev Execute an action by triggering its stored transaction, then flag the action as executed.
    /// Most of the time this function will be called by the "approve" function and should not be called directly.
    /// However if an action has reached N approvals and the quorum was later lowered bellow N,
    /// the "approve" function will not have executed it,
    /// and the action is now blocked waiting for another (unecessary) approval,
    /// in this case, anybody can call "execute" and the action will be executed.
    function executeAction(bytes32 hash) public
    actionShouldExists(hash) actionIsActive(hash) actionShouldHavReachedQuorum(hash) actionNotExecuted(hash) {
        actions[hash].executed = true;

        bytes memory _data;
        bool success;
        (success, _data) = actions[hash].to.call.value(actions[hash].value)(actions[hash].data); // solium-disable-line security/no-call-value

        emit ActionExecuted(hash, success, _data);
    }

    //-----------------------------
    //        ADMIN FUNCTIONS    //
    //-----------------------------

    /// @dev Create a new operation
    function admin_createOperation(
        uint256 operationId, string calldata name, address[] calldata whitelist, uint256 quorum
    ) external onlyAdmin() operationShouldNotExists(operationId) {
        require(whitelist.length > 0, "Whitelist cannot be empty");
        require(quorum > 0, "Quorum cannot be inferior to one");
        require(quorum <= whitelist.length + adminCount, "Quorum cannot be superior to whitelist length");

        operations[operationId].name = name;
        operations[operationId].quorum = quorum;
        operations[operationId].active = true;
        for(uint256 i = 0 ; i < whitelist.length ; i++) {
            operations[operationId].whitelist[whitelist[i]] = true;
        }
        operations[operationId].whitelistLength = whitelist.length;

        emit OperationCreated(operationId);
    }

    /// @dev Activate/Deactivate an operation
    function admin_operationSetActive(uint256 operationId, bool active) external onlyAdmin() operationShouldExists(operationId) {
        operations[operationId].active = active;
    }

    /// @dev Add a new Admin
    function admin_addAdmin(address newAdmin) external onlyAdmin() {
        require(newAdmin != address(this), "An organization cannot be admin of itself");
        adminCount++;
        adminList[newAdmin] = true;

        emit AdminAdded(newAdmin);
    }

    /// @dev Remove an Admin
    function admin_removeAdmin(address newAdmin) external onlyAdmin() canRemoveAdmin() {
        adminCount--;
        adminList[newAdmin] = true;

        emit AdminRemoved(newAdmin);
    }

    /// @dev Add a user to the whitelist of an operation
    function admin_addUserToWhitelist(uint256 operationId, address user) external
    onlyAdmin() operationShouldExists(operationId) operationIsActive(operationId) userNotAuthorized(operationId, user) {
        operations[operationId].whitelistLength++;
        operations[operationId].whitelist[user] = true;

        emit MemberAdded(operationId, user);
    }

    /// @dev Remove a user from the whitelist of an operation
    function admin_removeUserFromWhitelist(uint256 operationId, address user) external
    onlyAdmin() operationShouldExists(operationId) operationIsActive(operationId) canRemoveUser(operationId) {
        operations[operationId].whitelistLength--;
        operations[operationId].whitelist[user] = false;

        emit MemberRemoved(operationId, user);
    }

    /// @dev Modify the quorum of an operation
    function admin_modifyQuorum(uint256 operationId, uint256 newQuorum) external
    onlyAdmin() operationShouldExists(operationId) operationIsActive(operationId) canModifyQuorum(operationId, newQuorum) {
        operations[operationId].quorum = newQuorum;

        emit QuorumUpdated(operationId, newQuorum);
    }

    /// @dev Activate/Deactivate an action
    function admin_actionSetActive(bytes32 hash, bool active) external onlyAdmin() actionShouldExists(hash) {
        actions[hash].active = active;
    }

    function admin_destroyUsersContract(address payable user) public onlyAdmin() {
        ERC1077 usersContract = ERC1077(user);
        require(usersContract.getRecoverAddress() == address(this), "This organization is not authorized to destroy this user's wallet");
        usersContract.destroy();

        emit RecoverMember(user);
    }

    /// @dev allow an admin to withdraw all the ether
    function admin_withdraw() external onlyAdmin() {
        msg.sender.transfer(address(this).balance);

        emit AdminWithdraw(msg.sender, address(this).balance);
    }

    //-----------------------------
    //          GETTERS          //
    //-----------------------------

    // Actions --------------------
    function actionExists(bytes32 hash) public view returns(bool){
        if (actions[hash].to == address(0x0)) return false;
        return true;
    }
    function getAction(bytes32 hash) external view returns(
      uint256 operationId,
      uint256 approvalsCount,
      bool active,
      bool executed,
      address to, uint256 value, bytes memory data
    ) {
        return (
          actions[hash].operationId,
          actions[hash].approvalsCount,
          actions[hash].active,
          actions[hash].executed,
          actions[hash].to, actions[hash].value, actions[hash].data
        );
    }
    function hasApprovedAction(address user, bytes32 hash) external view returns(bool) {
        return actions[hash].approvals[user];
    }

    // Operations -----------------
    function operationExists(uint256 operationId) public view returns(bool){
        if (bytes(operations[operationId].name).length == 0) return false;
        return true;
    }
    function getOperation(uint256 operationId) external view returns(string memory name, uint256 whitelistLength, uint256 quorum, bool active) {
        return (
          operations[operationId].name,
          operations[operationId].whitelistLength,
          operations[operationId].quorum,
          operations[operationId].active
        );
    }
    function isWhitelisted(address user, uint256 operationId) public view returns(bool) {
        return adminList[user] || operations[operationId].whitelist[user];
    }

    // Admin ----------------------
    function isAdmin(address user) external view returns (bool){
        return adminList[user];
    }
    function getAdminCount() public view returns(uint256) {
        return adminCount;
    }

}
