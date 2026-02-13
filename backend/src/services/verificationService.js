// services/verificationService.js
import Property from '../models/Properties.js';
import { BlockchainService } from './blockchainService.js';
import { createHash } from 'crypto';

export const VerificationService = {
    /**
     * Verify a property by checking on-chain and off-chain data match
     */
    async verifyProperty(propertyId) {
        try {
            // Fetch property from MongoDB
            const property = await Property.findOne({ propertyId }).lean();

            if (!property) {
                return {
                    valid: false,
                    error: 'PROPERTY_NOT_FOUND',
                    message: 'Property not found in database'
                };
            }

            // Fetch property from blockchain
            let onChainData;
            try {
                onChainData = await BlockchainService.getProperty(propertyId);
            } catch (error) {
                return {
                    valid: false,
                    error: 'BLOCKCHAIN_ERROR',
                    message: 'Failed to fetch property from blockchain',
                    details: error.message
                };
            }

            if (!onChainData.exists) {
                return {
                    valid: false,
                    error: 'NOT_ON_CHAIN',
                    message: 'Property not registered on blockchain'
                };
            }

            // Compare hashes
            const dbDocHash = property.docHash;
            const chainDocHash = onChainData.docHash;

            // Convert bytes32 to hex string if needed
            const chainHashStr = chainDocHash.startsWith('0x')
                ? chainDocHash.slice(2)
                : chainDocHash;
            const dbHashStr = dbDocHash.startsWith('0x')
                ? dbDocHash.slice(2)
                : dbDocHash;

            const hashMatch = chainHashStr.toLowerCase() === dbHashStr.toLowerCase();

            // Compare IPFS CIDs
            const dbCID = property.ipfsCID || '';
            const chainCID = onChainData.fileRef || '';
            const cidMatch = dbCID === chainCID;

            // Compare owner
            const dbOwner = (property.ownerWallet || '').toLowerCase();
            const chainOwner = (onChainData.owner || '').toLowerCase();
            const ownerMatch = dbOwner === chainOwner;

            const isValid = hashMatch && cidMatch && ownerMatch;

            return {
                valid: isValid,
                propertyId,
                offChain: {
                    docHash: dbDocHash,
                    ipfsCID: dbCID,
                    owner: property.ownerWallet,
                    status: property.status,
                    registeredAt: property.createdAt
                },
                onChain: {
                    docHash: chainDocHash,
                    ipfsCID: chainCID,
                    owner: onChainData.owner,
                    status: onChainData.status === 0 ? 'CLEAR' : 'DISPUTED',
                    registeredAt: onChainData.createdAt ? new Date(onChainData.createdAt * 1000) : null
                },
                matches: {
                    docHash: hashMatch,
                    ipfsCID: cidMatch,
                    owner: ownerMatch
                },
                contractAddress: property.chain?.contractAddress,
                chainId: property.chain?.chainId
            };
        } catch (error) {
            return {
                valid: false,
                error: 'VERIFICATION_ERROR',
                message: 'Verification process failed',
                details: error.message
            };
        }
    },

    /**
     * Verify a property using QR data
     */
    async verifyFromQRData(qrData) {
        let data;

        // Parse QR data if it's a string
        if (typeof qrData === 'string') {
            try {
                data = JSON.parse(qrData);
            } catch {
                // Assume it's a propertyId
                return await this.verifyProperty(qrData);
            }
        } else {
            data = qrData;
        }

        // Extract propertyId from QR data
        const propertyId = data.propertyId;
        if (!propertyId) {
            return {
                valid: false,
                error: 'INVALID_QR_DATA',
                message: 'QR data does not contain propertyId'
            };
        }

        // Perform standard verification
        const result = await this.verifyProperty(propertyId);

        // Add QR data comparison
        if (result.valid && data.docHash) {
            const qrHashMatch = data.docHash === result.offChain.docHash;
            result.matches.qrDocHash = qrHashMatch;
            if (!qrHashMatch) {
                result.valid = false;
                result.error = 'QR_HASH_MISMATCH';
                result.message = 'Document hash in QR does not match stored hash';
            }
        }

        return result;
    },

    /**
     * Calculate hash of a buffer (for document verification)
     */
    calculateHash(buffer) {
        return createHash('sha256').update(buffer).digest('hex');
    },

    /**
     * Verify document hash matches stored hash
     */
    async verifyDocumentHash(propertyId, documentBuffer) {
        const property = await Property.findOne({ propertyId });
        if (!property) {
            throw new Error('Property not found');
        }

        const calculatedHash = this.calculateHash(documentBuffer);
        const storedHash = property.docHash.startsWith('0x')
            ? property.docHash.slice(2)
            : property.docHash;

        return calculatedHash === storedHash;
    }
};
