
pragma solidity ^0.5.14;

contract Movie2 {

    struct Share {
        address owner;
        uint256 percentage; // 100% == 100 000 to avoid precision loss
        uint256 parentShareId;
        bool isFinal;
    }

    struct Deal {
        address participantA;
        address participantB;
        uint256 percentageA; // 100% == 100 000 to avoid precision loss
        uint256 parentShareId;
        uint256 timestamp;
    }

    struct Payment {
        string buyer;
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Share) shares;
    uint256[] finalShares; // dynamic arrays to iterate over final shares only
    uint256 shareCount; // to iterate over the whole shares & create new shares with coherent id

    mapping(uint256 => Deal) deals;
    uint256 dealCount;

    mapping(uint256 => Payment) payments;
    uint256 paymentCount;

    event InitiatePayment(address indexed owner, uint256 indexed share, uint256 indexed price, string buyer);

    constructor(address initialShareOwner) public {
        shares[0] = Share(initialShareOwner, uint256(100000), 0, true);
        finalShares.push(0);
        shareCount = 1;
        dealCount = 0;
        paymentCount = 0;
    }

    function addDeal(address participantA, address participantB, uint256 percentageA, uint256 parentShareId) public {
        require(participantA != participantB, "Participant A & B cannot be the same address!");
        require(percentageA <= 100, "'percentageA' must be between 0 and 100!");
        require(shares[parentShareId].owner != address(0), "'parentShareId' must reference an existing share!");
        require(
            (shares[parentShareId].owner == participantA) ||
            (shares[parentShareId].owner == participantB),
            "Either one of the participant must be the owner of the parent share!"
        );
        require(shares[parentShareId].isFinal, "'parentShareId' has already been used as a parent!");

        // 1) add the deal ----------------------
        deals[dealCount] = Deal(participantA, participantB, percentageA, parentShareId, now);
        dealCount++;

        // 2) create 2 new shares ----------------------

        // 2.1) calculate new share percentage from parent share


        uint256 parentSharePercentage = shares[parentShareId].percentage / 10;

        // calculation explanation
        // exemple : parent share is 45%, A get 90% of 45% and B get 10% of 45%, at the end A has 40.5% and B 4.5%
        // parent share 45% = 45 000 -> 4 500

        // A's share 90% = 90 -> 9 000
        // B's share (100 - 90) = 10% -> 1 000

        // A new share : 4 500 * 9 000 = 40 500 000
        // B new share : 4 500 * 1 000 = 4 500 000

        // A new share : 40 500 000 / 1000 = 40 500 -> 40.5%
        // B new share : 4 500 000 / 1000 = 4 500 -> 4.5%

        uint256 finalSharePercentageA = ((percentageA * 100) * parentSharePercentage) / 1000;
        uint256 finalSharePercentageB = (((100 - percentageA) * 100) * parentSharePercentage) / 1000;

        // 2.2) update final shares (the tree's leaf)
        shares[parentShareId].isFinal = false; // the parent is no more a leaf (because it has now 2 childs)

        // 2.2.1) find and remove parentShareId from the finalShares array
        uint256 parentShareIndex = _getFirst(parentShareId);
        // if parentShareIndex == -1 ERROR
        _burn(parentShareIndex);

        // 2.2.2) add new shares to the shares mapping and the finalShares array
        uint256 newShareIdA = shareCount;
        shareCount++;
        uint256 newShareIdB = shareCount;
        shareCount++;

        finalShares.push(newShareIdA);
        finalShares.push(newShareIdB);

        shares[newShareIdA] = Share(participantA, finalSharePercentageA, parentShareId, true);
        shares[newShareIdB] = Share(participantB, finalSharePercentageB, parentShareId, true);
    }

    function pay(string memory buyer, uint256 price) public {
        payments[paymentCount] = Payment(buyer, price, now);
        paymentCount++;

        for(uint256 i = 0 ; i < finalShares.length ; i++) {
            Share memory finalShare = shares[finalShares[i]];
            emit InitiatePayment(finalShare.owner, finalShare.percentage, price, buyer);
        }
    }

    //-------------------------------------
    // somehow byzantium solidity doesn't include getters for public value, so we need to define them

    function getShare(uint256 id) public view returns(address, uint256, uint256, bool) {
        Share memory share = shares[id];
        return (share.owner, share.percentage, share.parentShareId, share.isFinal);
    }

    function getDeal(uint256 id) public view returns(address, address, uint256, uint256, uint256) {
        Deal memory deal = deals[id];
        return (deal.participantA, deal.participantB, deal.percentageA, deal.parentShareId, deal.timestamp);
    }

    function getPayment(uint256 id) public view returns(string memory, uint256, uint256) {
        Payment memory payment = payments[id];
        return (payment.buyer, payment.price, payment.timestamp);
    }

    function getShareCount() public view returns(uint256) {
        return shareCount;
    }

    function getDealCount() public view returns(uint256) {
        return dealCount;
    }

    function getPaymentCount() public view returns(uint256) {
        return paymentCount;
    }

    //-------------------------------------
    // helpers functions

    // return index of the first occurence of a given value, or -1 (x0ffff..f) if not found
    function _getFirst(uint256 value) internal view returns(uint256) {
        for(uint256 i = 0 ; i < finalShares.length ; i++) {
            if (finalShares[i] == value) {
                return i;
            }
        }
        return uint256(-1);
    }

    // efficiently delete array element at index but does not preserve elements order
    function _burn(uint256 index) internal {
        require(index < finalShares.length, 'Array index out of bounds');
        finalShares[index] = finalShares[finalShares.length-1];
        delete finalShares[finalShares.length-1];
        finalShares.length--;
    }
}
