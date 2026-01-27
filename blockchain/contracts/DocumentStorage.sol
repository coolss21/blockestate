// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentStorage
 * @dev Stores and verifies document hashes for properties in the land registry system
 */
contract DocumentStorage {
    struct Document {
        string ipfsCID;
        bytes32 docHash;
        uint256 timestamp;
        address storedBy;
        bool exists;
    }

    // Mapping from propertyId to document
    mapping(string => Document) private documents;
    
    // Role-based access (simplified - in production, use RoleAccess contract)
    mapping(address => bool) public isRegistrar;
    address public admin;

    event DocumentStored(
        string indexed propertyId, 
        string ipfsCID, 
        bytes32 docHash, 
        address indexed storedBy, 
        uint256 timestamp
    );
    
    event DocumentUpdated(
        string indexed propertyId, 
        string ipfsCID, 
        bytes32 docHash, 
        address indexed updatedBy, 
        uint256 timestamp
    );
    
    event DocumentVerified(
        string indexed propertyId, 
        bool isValid, 
        address indexed verifiedBy, 
        uint256 timestamp
    );

    modifier onlyRegistrar() {
        require(isRegistrar[msg.sender] || msg.sender == admin, "NOT_REGISTRAR");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    constructor() {
        admin = msg.sender;
        isRegistrar[msg.sender] = true;
    }

    /**
     * @dev Set registrar permission
     * @param account Address to grant/revoke registrar role
     * @param allowed True to grant, false to revoke
     */
    function setRegistrar(address account, bool allowed) external onlyAdmin {
        isRegistrar[account] = allowed;
    }

    /**
     * @dev Store a document for a property
     * @param propertyId Unique property identifier
     * @param ipfsCID IPFS content identifier
     * @param docHash SHA-256 hash of the document
     */
    function storeDocument(
        string calldata propertyId,
        string calldata ipfsCID,
        bytes32 docHash
    ) external onlyRegistrar {
        require(bytes(propertyId).length > 0, "INVALID_PROPERTY_ID");
        require(bytes(ipfsCID).length > 0, "INVALID_IPFS_CID");
        require(docHash != bytes32(0), "INVALID_DOC_HASH");

        bool isUpdate = documents[propertyId].exists;

        documents[propertyId] = Document({
            ipfsCID: ipfsCID,
            docHash: docHash,
            timestamp: block.timestamp,
            storedBy: msg.sender,
            exists: true
        });

        if (isUpdate) {
            emit DocumentUpdated(propertyId, ipfsCID, docHash, msg.sender, block.timestamp);
        } else {
            emit DocumentStored(propertyId, ipfsCID, docHash, msg.sender, block.timestamp);
        }
    }

    /**
     * @dev Get document details for a property
     * @param propertyId Unique property identifier
     * @return ipfsCID IPFS content identifier
     * @return docHash Document hash
     * @return timestamp When the document was stored
     * @return storedBy Address that stored the document
     * @return exists Whether the document exists
     */
    function getDocument(string calldata propertyId) 
        external 
        view 
        returns (
            string memory ipfsCID,
            bytes32 docHash,
            uint256 timestamp,
            address storedBy,
            bool exists
        ) 
    {
        Document memory doc = documents[propertyId];
        return (
            doc.ipfsCID,
            doc.docHash,
            doc.timestamp,
            doc.storedBy,
            doc.exists
        );
    }

    /**
     * @dev Verify a document hash for a property
     * @param propertyId Unique property identifier
     * @param docHash Hash to verify
     * @return isValid True if the hash matches the stored hash
     */
    function verifyDocument(string calldata propertyId, bytes32 docHash) 
        external 
        returns (bool isValid) 
    {
        require(documents[propertyId].exists, "DOCUMENT_NOT_FOUND");
        
        isValid = documents[propertyId].docHash == docHash;
        
        emit DocumentVerified(propertyId, isValid, msg.sender, block.timestamp);
        
        return isValid;
    }

    /**
     * @dev Check if a document exists for a property
     * @param propertyId Unique property identifier
     * @return exists True if document exists
     */
    function documentExists(string calldata propertyId) external view returns (bool) {
        return documents[propertyId].exists;
    }

    /**
     * @dev Get document hash only
     * @param propertyId Unique property identifier
     * @return docHash The stored document hash
     */
    function getDocumentHash(string calldata propertyId) external view returns (bytes32) {
        require(documents[propertyId].exists, "DOCUMENT_NOT_FOUND");
        return documents[propertyId].docHash;
    }

    /**
     * @dev Get IPFS CID only
     * @param propertyId Unique property identifier
     * @return ipfsCID The stored IPFS CID
     */
    function getIPFSCID(string calldata propertyId) external view returns (string memory) {
        require(documents[propertyId].exists, "DOCUMENT_NOT_FOUND");
        return documents[propertyId].ipfsCID;
    }
}
