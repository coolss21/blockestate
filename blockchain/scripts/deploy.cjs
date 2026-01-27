/*
  Deploy script (CommonJS) – deploys all 4 contracts for BlockEstate

  Usage:
    1) In one terminal:  npm install && npx hardhat node
    2) In another terminal: npx hardhat run scripts/deploy.cjs --network localhost

  It prints the deployed contract addresses and writes them to deployments/addresses.json
*/

const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const addresses = {};

  // 1. Deploy RoleAccess
  console.log('\n1. Deploying RoleAccess...');
  const RoleAccessFactory = await hre.ethers.getContractFactory('RoleAccess');
  const roleAccess = await RoleAccessFactory.deploy();
  await roleAccess.waitForDeployment();
  addresses.RoleAccess = await roleAccess.getAddress();
  console.log('   RoleAccess deployed to:', addresses.RoleAccess);

  // 2. Deploy DocumentStorage
  console.log('\n2. Deploying DocumentStorage...');
  const DocumentStorageFactory = await hre.ethers.getContractFactory('DocumentStorage');
  const documentStorage = await DocumentStorageFactory.deploy();
  await documentStorage.waitForDeployment();
  addresses.DocumentStorage = await documentStorage.getAddress();
  console.log('   DocumentStorage deployed to:', addresses.DocumentStorage);

  // 3. Deploy FraudTimeline
  console.log('\n3. Deploying FraudTimeline...');
  const FraudTimelineFactory = await hre.ethers.getContractFactory('FraudTimeline');
  const fraudTimeline = await FraudTimelineFactory.deploy();
  await fraudTimeline.waitForDeployment();
  addresses.FraudTimeline = await fraudTimeline.getAddress();
  console.log('   FraudTimeline deployed to:', addresses.FraudTimeline);

  // 4. Deploy PropertyRegistry
  console.log('\n4. Deploying PropertyRegistry...');
  const PropertyRegistryFactory = await hre.ethers.getContractFactory('PropertyRegistry');
  const propertyRegistry = await PropertyRegistryFactory.deploy();
  await propertyRegistry.waitForDeployment();
  addresses.PropertyRegistry = await propertyRegistry.getAddress();
  console.log('   PropertyRegistry deployed to:', addresses.PropertyRegistry);

  // Save addresses to file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const addressesPath = path.join(deploymentsDir, 'addresses.json');
  const deploymentData = {
    network: 'localhost',
    chainId: 31337,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: addresses
  };

  fs.writeFileSync(addressesPath, JSON.stringify(deploymentData, null, 2));
  console.log('\n✅ Deployment complete!');
  console.log('📄 Addresses saved to:', addressesPath);
  console.log('\n📋 Summary:');
  console.log(JSON.stringify(addresses, null, 2));
  console.log('\n⚠️  Copy PropertyRegistry address to backend/.env as CONTRACT_ADDRESS');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
