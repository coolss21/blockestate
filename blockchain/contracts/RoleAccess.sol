// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleAccess
 * @dev Manages role-based access control for the BlockEstate land registry system
 * Roles: Admin, Registrar, Court
 */
contract RoleAccess {
    address public admin;

    mapping(address => bool) public isRegistrar;
    mapping(address => bool) public isCourt;
    mapping(address => bool) public isAdmin;

    event RoleAssigned(address indexed account, string role, address indexed by, uint256 timestamp);
    event RoleRevoked(address indexed account, string role, address indexed by, uint256 timestamp);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin, uint256 timestamp);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "NOT_ADMIN");
        _;
    }

    constructor() {
        admin = msg.sender;
        isAdmin[msg.sender] = true;
        emit RoleAssigned(msg.sender, "admin", msg.sender, block.timestamp);
    }

    /**
     * @dev Assign registrar role to an account
     * @param account Address to assign role to
     */
    function assignRegistrar(address account) external onlyAdmin {
        require(account != address(0), "INVALID_ADDRESS");
        require(!isRegistrar[account], "ALREADY_REGISTRAR");
        
        isRegistrar[account] = true;
        emit RoleAssigned(account, "registrar", msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke registrar role from an account
     * @param account Address to revoke role from
     */
    function revokeRegistrar(address account) external onlyAdmin {
        require(isRegistrar[account], "NOT_REGISTRAR");
        
        isRegistrar[account] = false;
        emit RoleRevoked(account, "registrar", msg.sender, block.timestamp);
    }

    /**
     * @dev Assign court role to an account
     * @param account Address to assign role to
     */
    function assignCourt(address account) external onlyAdmin {
        require(account != address(0), "INVALID_ADDRESS");
        require(!isCourt[account], "ALREADY_COURT");
        
        isCourt[account] = true;
        emit RoleAssigned(account, "court", msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke court role from an account
     * @param account Address to revoke role from
     */
    function revokeCourt(address account) external onlyAdmin {
        require(isCourt[account], "NOT_COURT");
        
        isCourt[account] = false;
        emit RoleRevoked(account, "court", msg.sender, block.timestamp);
    }

    /**
     * @dev Assign admin role to an account
     * @param account Address to assign role to
     */
    function assignAdmin(address account) external onlyAdmin {
        require(account != address(0), "INVALID_ADDRESS");
        require(!isAdmin[account], "ALREADY_ADMIN");
        
        isAdmin[account] = true;
        emit RoleAssigned(account, "admin", msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke admin role from an account
     * @param account Address to revoke role from
     */
    function revokeAdmin(address account) external onlyAdmin {
        require(isAdmin[account], "NOT_ADMIN_ROLE");
        require(account != admin, "CANNOT_REVOKE_PRIMARY_ADMIN");
        
        isAdmin[account] = false;
        emit RoleRevoked(account, "admin", msg.sender, block.timestamp);
    }

    /**
     * @dev Transfer primary admin to a new account
     * @param newAdmin Address of new primary admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(msg.sender == admin, "ONLY_PRIMARY_ADMIN");
        require(newAdmin != address(0), "INVALID_ADDRESS");
        require(newAdmin != admin, "ALREADY_ADMIN");

        address previousAdmin = admin;
        admin = newAdmin;
        isAdmin[newAdmin] = true;

        emit AdminTransferred(previousAdmin, newAdmin, block.timestamp);
    }

    /**
     * @dev Check if an account has a specific role
     * @param account Address to check
     * @param role Role to check ("admin", "registrar", "court")
     * @return bool True if account has the role
     */
    function hasRole(address account, string calldata role) external view returns (bool) {
        bytes32 roleHash = keccak256(abi.encodePacked(role));
        
        if (roleHash == keccak256(abi.encodePacked("admin"))) {
            return isAdmin[account];
        } else if (roleHash == keccak256(abi.encodePacked("registrar"))) {
            return isRegistrar[account];
        } else if (roleHash == keccak256(abi.encodePacked("court"))) {
            return isCourt[account];
        }
        
        return false;
    }

    /**
     * @dev Get all roles for an account
     * @param account Address to check
     * @return roles Array of role strings
     */
    function getRoles(address account) external view returns (string[] memory roles) {
        uint256 count = 0;
        if (isAdmin[account]) count++;
        if (isRegistrar[account]) count++;
        if (isCourt[account]) count++;

        roles = new string[](count);
        uint256 index = 0;

        if (isAdmin[account]) {
            roles[index] = "admin";
            index++;
        }
        if (isRegistrar[account]) {
            roles[index] = "registrar";
            index++;
        }
        if (isCourt[account]) {
            roles[index] = "court";
        }

        return roles;
    }
}
