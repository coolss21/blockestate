// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FraudTimeline
 * @dev Tracks and logs all events related to property disputes and fraud detection
 */
contract FraudTimeline {
    enum EventType {
        DISPUTE_FLAGGED,
        DISPUTE_CLEARED,
        TRANSFER_BLOCKED,
        COURT_ORDER_ISSUED,
        PROPERTY_REGISTERED,
        OWNERSHIP_TRANSFERRED,
        INVESTIGATION_STARTED,
        INVESTIGATION_CLOSED
    }

    struct TimelineEvent {
        EventType eventType;
        string propertyId;
        address actor;
        string message;
        string caseId;
        bytes32 txHash;
        uint256 blockNumber;
        uint256 timestamp;
    }

    // Array of all timeline events
    TimelineEvent[] private allEvents;
    
    // Mapping from propertyId to array of event indices
    mapping(string => uint256[]) private propertyEvents;
    
    // Role-based access
    mapping(address => bool) public isCourt;
    mapping(address => bool) public isRegistrar;
    address public admin;

    event FraudEventLogged(
        EventType indexed eventType,
        string indexed propertyId,
        address indexed actor,
        string message,
        string caseId,
        uint256 timestamp
    );

    modifier onlyCourt() {
        require(isCourt[msg.sender] || msg.sender == admin, "NOT_COURT");
        _;
    }

    modifier onlyRegistrar() {
        require(isRegistrar[msg.sender] || msg.sender == admin, "NOT_REGISTRAR");
        _;
    }

    modifier onlyAuthorized() {
        require(
            isCourt[msg.sender] || isRegistrar[msg.sender] || msg.sender == admin,
            "NOT_AUTHORIZED"
        );
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    constructor() {
        admin = msg.sender;
        isCourt[msg.sender] = true;
        isRegistrar[msg.sender] = true;
    }

    /**
     * @dev Set court permission
     */
    function setCourt(address account, bool allowed) external onlyAdmin {
        isCourt[account] = allowed;
    }

    /**
     * @dev Set registrar permission
     */
    function setRegistrar(address account, bool allowed) external onlyAdmin {
        isRegistrar[account] = allowed;
    }

    /**
     * @dev Log a dispute flagged event
     */
    function logDisputeFlagged(
        string calldata propertyId,
        string calldata reason,
        string calldata caseId
    ) external onlyCourt {
        _logEvent(
            EventType.DISPUTE_FLAGGED,
            propertyId,
            msg.sender,
            reason,
            caseId
        );
    }

    /**
     * @dev Log a dispute cleared event
     */
    function logDisputeCleared(
        string calldata propertyId,
        string calldata resolution,
        string calldata caseId
    ) external onlyCourt {
        _logEvent(
            EventType.DISPUTE_CLEARED,
            propertyId,
            msg.sender,
            resolution,
            caseId
        );
    }

    /**
     * @dev Log a transfer blocked event
     */
    function logTransferBlocked(
        string calldata propertyId,
        string calldata reason
    ) external onlyAuthorized {
        _logEvent(
            EventType.TRANSFER_BLOCKED,
            propertyId,
            msg.sender,
            reason,
            ""
        );
    }

    /**
     * @dev Log a court order issued event
     */
    function logCourtOrder(
        string calldata propertyId,
        string calldata orderDetails,
        string calldata caseId
    ) external onlyCourt {
        _logEvent(
            EventType.COURT_ORDER_ISSUED,
            propertyId,
            msg.sender,
            orderDetails,
            caseId
        );
    }

    /**
     * @dev Log a property registered event
     */
    function logPropertyRegistered(
        string calldata propertyId,
        string calldata details
    ) external onlyRegistrar {
        _logEvent(
            EventType.PROPERTY_REGISTERED,
            propertyId,
            msg.sender,
            details,
            ""
        );
    }

    /**
     * @dev Log an ownership transferred event
     */
    function logOwnershipTransferred(
        string calldata propertyId,
        string calldata details
    ) external onlyRegistrar {
        _logEvent(
            EventType.OWNERSHIP_TRANSFERRED,
            propertyId,
            msg.sender,
            details,
            ""
        );
    }

    /**
     * @dev Log an investigation started event
     */
    function logInvestigationStarted(
        string calldata propertyId,
        string calldata reason,
        string calldata caseId
    ) external onlyCourt {
        _logEvent(
            EventType.INVESTIGATION_STARTED,
            propertyId,
            msg.sender,
            reason,
            caseId
        );
    }

    /**
     * @dev Log an investigation closed event
     */
    function logInvestigationClosed(
        string calldata propertyId,
        string calldata outcome,
        string calldata caseId
    ) external onlyCourt {
        _logEvent(
            EventType.INVESTIGATION_CLOSED,
            propertyId,
            msg.sender,
            outcome,
            caseId
        );
    }

    /**
     * @dev Internal function to log an event
     */
    function _logEvent(
        EventType eventType,
        string memory propertyId,
        address actor,
        string memory message,
        string memory caseId
    ) private {
        TimelineEvent memory newEvent = TimelineEvent({
            eventType: eventType,
            propertyId: propertyId,
            actor: actor,
            message: message,
            caseId: caseId,
            txHash: blockhash(block.number - 1),
            blockNumber: block.number,
            timestamp: block.timestamp
        });

        uint256 eventIndex = allEvents.length;
        allEvents.push(newEvent);
        propertyEvents[propertyId].push(eventIndex);

        emit FraudEventLogged(
            eventType,
            propertyId,
            actor,
            message,
            caseId,
            block.timestamp
        );
    }

    /**
     * @dev Get fraud timeline for a property
     * @param propertyId Unique property identifier
     * @return events Array of timeline events
     */
    function getFraudTimeline(string calldata propertyId)
        external
        view
        returns (TimelineEvent[] memory events)
    {
        uint256[] memory eventIndices = propertyEvents[propertyId];
        events = new TimelineEvent[](eventIndices.length);

        for (uint256 i = 0; i < eventIndices.length; i++) {
            events[i] = allEvents[eventIndices[i]];
        }

        return events;
    }

    /**
     * @dev Get event count for a property
     */
    function getEventCount(string calldata propertyId) external view returns (uint256) {
        return propertyEvents[propertyId].length;
    }

    /**
     * @dev Get total event count across all properties
     */
    function getTotalEventCount() external view returns (uint256) {
        return allEvents.length;
    }

    /**
     * @dev Calculate fraud risk score based on event history
     * @param propertyId Unique property identifier
     * @return score Risk score (0-100)
     * @return risk Risk level string
     */
    function getFraudRiskScore(string calldata propertyId)
        external
        view
        returns (uint256 score, string memory risk)
    {
        uint256[] memory eventIndices = propertyEvents[propertyId];
        uint256 riskScore = 0;

        for (uint256 i = 0; i < eventIndices.length; i++) {
            EventType eventType = allEvents[eventIndices[i]].eventType;

            if (eventType == EventType.DISPUTE_FLAGGED) {
                riskScore += 40;
            } else if (eventType == EventType.TRANSFER_BLOCKED) {
                riskScore += 30;
            } else if (eventType == EventType.INVESTIGATION_STARTED) {
                riskScore += 25;
            } else if (eventType == EventType.COURT_ORDER_ISSUED) {
                riskScore += 20;
            } else if (eventType == EventType.DISPUTE_CLEARED) {
                riskScore = riskScore > 20 ? riskScore - 20 : 0;
            } else if (eventType == EventType.INVESTIGATION_CLOSED) {
                riskScore = riskScore > 15 ? riskScore - 15 : 0;
            }
        }

        // Cap at 100
        score = riskScore > 100 ? 100 : riskScore;

        // Determine risk level
        if (score >= 70) {
            risk = "HIGH";
        } else if (score >= 30) {
            risk = "MEDIUM";
        } else {
            risk = "LOW";
        }

        return (score, risk);
    }
}
