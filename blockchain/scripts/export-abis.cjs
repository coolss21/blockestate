/*
  Export ABIs script - copies contract ABIs and addresses to backend and frontend
  
  Usage:
    Run after deployment: node scripts/export-abis.cjs
    Or add to package.json scripts
*/

const fs = require('fs');
const path = require('path');

async function main() {
    console.log('📦 Exporting contract ABIs and addresses...\n');

    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    const backendDir = path.join(__dirname, '..', '..', 'backend', 'src', 'contracts');
    const frontendDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'contracts');

    // Create directories if they don't exist
    [backendDir, frontendDir].forEach(dir => {
        const abisDir = path.join(dir, 'abis');
        if (!fs.existsSync(abisDir)) {
            fs.mkdirSync(abisDir, { recursive: true });
        }
    });

    const contracts = ['RoleAccess', 'DocumentStorage', 'FraudTimeline', 'PropertyRegistry'];

    // Copy ABIs
    contracts.forEach(contractName => {
        const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);

        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            const abi = artifact.abi;

            // Write to backend
            const backendAbiPath = path.join(backendDir, 'abis', `${contractName}.json`);
            fs.writeFileSync(backendAbiPath, JSON.stringify(abi, null, 2));
            console.log(`✓ Copied ${contractName} ABI to backend`);

            // Write to frontend
            const frontendAbiPath = path.join(frontendDir, 'abis', `${contractName}.json`);
            fs.writeFileSync(frontendAbiPath, JSON.stringify(abi, null, 2));
            console.log(`✓ Copied ${contractName} ABI to frontend`);
        } else {
            console.warn(`⚠️  Warning: ${contractName} artifact not found at ${artifactPath}`);
        }
    });

    // Copy addresses
    const addressesPath = path.join(deploymentsDir, 'addresses.json');
    if (fs.existsSync(addressesPath)) {
        const addresses = fs.readFileSync(addressesPath, 'utf8');

        // Backend
        const backendAddressesPath = path.join(backendDir, 'addresses.json');
        fs.writeFileSync(backendAddressesPath, addresses);
        console.log('\n✓ Copied addresses to backend');

        // Frontend
        const frontendAddressesPath = path.join(frontendDir, 'addresses.json');
        fs.writeFileSync(frontendAddressesPath, addresses);
        console.log('✓ Copied addresses to frontend');
    } else {
        console.warn('\n⚠️  Warning: addresses.json not found. Run deployment first.');
    }

    console.log('\n✅ Export complete!\n');
}

main().catch((err) => {
    console.error('❌ Export failed:', err);
    process.exitCode = 1;
});
