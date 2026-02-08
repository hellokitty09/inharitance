import { ethers } from "hardhat";

async function main() {
    const PoliticalDonation = await ethers.getContractFactory("PoliticalDonation");
    const contract = await PoliticalDonation.deploy();

    await contract.waitForDeployment();

    console.log("PoliticalDonation deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
