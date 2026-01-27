// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyRegistry {
    enum Status { CLEAR, DISPUTED }

    struct Record {
        bytes32 docHash;
        string fileRef;
        uint256 createdAt;
        address owner;
        address registrar;
        Status status;
        string disputeReason;
        string disputeCaseId;
        uint256 disputeAt;
        bool exists;
    }

    mapping(address => bool) public isRegistrar;
    mapping(address => bool) public isCourt;

    mapping(string => Record) private records;

    mapping(string => bool) public transferPending;
    mapping(string => address) public pendingBuyer;

    event PropertyRegistered(string indexed propertyId, bytes32 docHash, string fileRef, address owner, address registrar, uint256 timestamp);
    event TransferInitiated(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp);
    event TransferFinalized(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp);
    event DisputeFlagged(string indexed propertyId, string reason, string caseId, address indexed by, uint256 timestamp);
    event DisputeCleared(string indexed propertyId, address indexed by, uint256 timestamp);

    modifier onlyRegistrar() {
        require(isRegistrar[msg.sender], "NOT_REGISTRAR");
        _;
    }

    modifier onlyCourt() {
        require(isCourt[msg.sender], "NOT_COURT");
        _;
    }

    modifier existsProperty(string calldata propertyId) {
        require(records[propertyId].exists, "NOT_FOUND");
        _;
    }

    modifier notDisputed(string calldata propertyId) {
        require(records[propertyId].status == Status.CLEAR, "DISPUTED_FROZEN");
        _;
    }

    constructor() {
        // deployer is initial registrar + court for demo
        isRegistrar[msg.sender] = true;
        isCourt[msg.sender] = true;
    }

    function setRegistrar(address who, bool allowed) external onlyRegistrar {
        isRegistrar[who] = allowed;
    }

    function setCourt(address who, bool allowed) external onlyRegistrar {
        isCourt[who] = allowed;
    }

    function registerProperty(
        string calldata propertyId,
        bytes32 docHash,
        string calldata fileRef,
        address owner
    ) external onlyRegistrar {
        require(!records[propertyId].exists, "ALREADY_REGISTERED");

        records[propertyId] = Record({
            docHash: docHash,
            fileRef: fileRef,
            createdAt: block.timestamp,
            owner: owner,
            registrar: msg.sender,
            status: Status.CLEAR,
            disputeReason: "",
            disputeCaseId: "",
            disputeAt: 0,
            exists: true
        });

        emit PropertyRegistered(propertyId, docHash, fileRef, owner, msg.sender, block.timestamp);
    }

    function initiateTransfer(string calldata propertyId, address buyer)
        external
        existsProperty(propertyId)
        notDisputed(propertyId)
    {
        Record memory r = records[propertyId];
        require(msg.sender == r.owner, "NOT_OWNER");
        require(!transferPending[propertyId], "TRANSFER_ALREADY_PENDING");
        require(buyer != address(0), "BAD_BUYER");

        transferPending[propertyId] = true;
        pendingBuyer[propertyId] = buyer;

        emit TransferInitiated(propertyId, r.owner, buyer, block.timestamp);
    }

    function finalizeTransfer(string calldata propertyId)
        external
        onlyRegistrar
        existsProperty(propertyId)
        notDisputed(propertyId)
    {
        require(transferPending[propertyId], "NO_PENDING_TRANSFER");

        address from = records[propertyId].owner;
        address to = pendingBuyer[propertyId];

        records[propertyId].owner = to;
        transferPending[propertyId] = false;
        pendingBuyer[propertyId] = address(0);

        emit TransferFinalized(propertyId, from, to, block.timestamp);
    }

    function flagDispute(string calldata propertyId, string calldata reason, string calldata caseId)
        external
        onlyCourt
        existsProperty(propertyId)
    {
        records[propertyId].status = Status.DISPUTED;
        records[propertyId].disputeReason = reason;
        records[propertyId].disputeCaseId = caseId;
        records[propertyId].disputeAt = block.timestamp;

        emit DisputeFlagged(propertyId, reason, caseId, msg.sender, block.timestamp);
    }

    function clearDispute(string calldata propertyId)
        external
        onlyCourt
        existsProperty(propertyId)
    {
        records[propertyId].status = Status.CLEAR;
        records[propertyId].disputeReason = "";
        records[propertyId].disputeCaseId = "";
        records[propertyId].disputeAt = 0;

        emit DisputeCleared(propertyId, msg.sender, block.timestamp);
    }

    function getProperty(string calldata propertyId)
        external
        view
        returns (
            bool exists,
            bytes32 docHash,
            string memory fileRef,
            uint256 createdAt,
            address owner,
            Status status,
            string memory disputeReason,
            string memory disputeCaseId,
            uint256 disputeAt,
            bool isTransferPending,
            address buyer
        )
    {
        Record memory r = records[propertyId];
        return (
            r.exists,
            r.docHash,
            r.fileRef,
            r.createdAt,
            r.owner,
            r.status,
            r.disputeReason,
            r.disputeCaseId,
            r.disputeAt,
            transferPending[propertyId],
            pendingBuyer[propertyId]
        );
    }
}
