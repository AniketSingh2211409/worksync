const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("=".repeat(50));
  console.log(`DEPLOYING FREELANCING PLATFORM TO: ${network.toUpperCase()}`);
  console.log("=".repeat(50));
  console.log("🔗 Deployer address:", deployer.address);

  // Get contract factory and deploy contract
  const FreelancingPlatform = await hre.ethers.getContractFactory(
    "FreelancingPlatform"
  );

  console.log("🚀 Deploying contract...");
  const contract = await FreelancingPlatform.deploy(); // add constructor args if needed

  // Wait for deployment to complete
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed at:", contractAddress);

  // Display some contract state variables
  try {
    const platformFee = await contract.platformFee();
    const owner = await contract.owner();

    console.log("✅ Platform fee:", platformFee.toString(), "basis points");
    console.log("✅ Contract owned by:", owner);
  } catch (error) {
    console.log(
      "ℹ️  Could not fetch contract state (this is normal for some contracts)"
    );
  }

  // If on local dev network, setup test users and jobs
  if (network === "hardhat" || network === "localhost") {
    console.log("\n🔧 Setting up development environment...");

    await setupTestUsers(contract, user1, user2);
    await setupTestJobs(contract, user1, user2);

    console.log("✅ Development setup completed!");
  }

  // Save deployment info to disk
  await saveDeploymentInfo(
    contract,
    network,
    deployer.address,
    contractAddress
  );
  console.log("✅ Deployment info saved.\n");

  // Display final deployment summary
  console.log("=".repeat(50));
  console.log("🎉 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log(`Network: ${network}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Gas Used: Check transaction hash for details`);
  console.log("=".repeat(50));

  // If on testnet, provide helpful links
  if (network === "sepolia") {
    console.log("🔍 Verify your contract on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  } else if (network === "goerli") {
    console.log("🔍 Verify your contract on Etherscan:");
    console.log(`https://goerli.etherscan.io/address/${contractAddress}`);
  } else if (network === "polygon-mumbai") {
    console.log("🔍 Verify your contract on PolygonScan:");
    console.log(`https://mumbai.polygonscan.com/address/${contractAddress}`);
  }
}

async function setupTestUsers(contract, user1, user2) {
  console.log("📝 Registering test users...");

  try {
    const tx1 = await contract
      .connect(user1)
      .registerUser(
        "Alice Johnson",
        "alice@example.com",
        "Full-stack developer with 5+ years experience",
        "JavaScript, React, Node.js, Solidity",
        "assets/images/placeholder-avatar.jpg",
        2
      );
    await tx1.wait();

    const tx2 = await contract
      .connect(user2)
      .registerUser(
        "Bob Smith",
        "bob@example.com",
        "UI/UX designer specializing in web3 applications",
        "Figma, Adobe XD, Sketch, Prototyping",
        "assets/images/success-celebration.jpg",
        1
      );
    await tx2.wait();

    console.log("✅ Test users registered.");
  } catch (error) {
    console.error("❌ Failed to register test users:", error.message);
  }
}

async function setupTestJobs(contract, client, freelancer) {
  console.log("💼 Creating test jobs...");

  try {
    const oneEther = hre.ethers.parseEther("1");
    const halfEther = hre.ethers.parseEther("0.5");

    const tx1 = await contract.connect(client).postJob(
      "Build a DeFi Dashboard",
      "Create a DeFi dashboard with wallet integration, portfolio tracking, and yield farming analytics.",
      "React,Web3.js,Node.js,Chart.js", // Convert array to comma-separated string
      Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      0, // category
      { value: oneEther }
    );
    await tx1.wait();

    const tx2 = await contract.connect(client).postJob(
      "Design NFT Marketplace UI",
      "Design an intuitive UI for an NFT marketplace with filtering & discovery.",
      "Figma,UI/UX,Web Design,Prototyping", // Convert array to comma-separated string
      Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days from now
      1, // category
      { value: halfEther }
    );
    await tx2.wait();

    console.log("✅ Test jobs posted.");
  } catch (error) {
    console.error("❌ Failed to create test jobs:", error.message);
  }
}

async function saveDeploymentInfo(
  contract,
  network,
  deployer,
  contractAddress
) {
  const deploymentInfo = {
    network,
    contractAddress: contractAddress,
    deployer,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  try {
    const deploymentDir = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const filePath = path.join(deploymentDir, `${network}.json`);
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

    // Create a constants file for frontend
    const constantsPath = path.join(deploymentDir, `${network}-constants.js`);
    const frontendConstants = `// Auto-generated constants for ${network}
export const CONTRACT_ADDRESS = "${contractAddress}";
export const NETWORK = "${network}";
export const DEPLOYED_AT = "${deploymentInfo.deployedAt}";
export const BLOCK_NUMBER = ${deploymentInfo.blockNumber};

// Add this to your .env file:
// REACT_APP_CONTRACT_ADDRESS=${contractAddress}
`;

    fs.writeFileSync(constantsPath, frontendConstants);

    // Create .env template
    const envTemplatePath = path.join(deploymentDir, `${network}.env`);
    const envTemplate = `# Environment variables for ${network}
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_NETWORK=${network}
REACT_APP_INFURA_KEY=your_infura_key_here
`;

    fs.writeFileSync(envTemplatePath, envTemplate);

    console.log(`📄 Saved deployment files to ${deploymentDir}/`);
    console.log(`  - ${network}.json (deployment info)`);
    console.log(`  - ${network}-constants.js (frontend constants)`);
    console.log(`  - ${network}.env (environment template)`);
  } catch (error) {
    console.error("❌ Failed to save deployment info:", error);
  }
}

// Handle errors and cleanup
main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
