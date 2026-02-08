import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PoliticalDonationModule", (m) => {
    const politicalDonation = m.contract("PoliticalDonation");

    return { politicalDonation };
});
