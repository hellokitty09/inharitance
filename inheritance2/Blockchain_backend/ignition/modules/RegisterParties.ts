import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegisterPartiesModule = buildModule("RegisterPartiesModule", (m) => {
    const contract = m.contractAt("PoliticalDonation", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

    const parties = [
        { name: "Bharatiya Janata Party", address: "0x77a945ca4F6e32F12dF9804064d9eb11E52A5cEB", type: 1, location: "National" },
        { name: "Shiv Sena", address: "0x7aa906b21D97575038D73be7814c916c489dc4ed", type: 0, location: "Maharashtra" },
        { name: "Indian National Congress", address: "0x5d3e73396eAeE013D100f5190dAb1854b31eb43E", type: 1, location: "National" },
        { name: "Nationalist Congress Party", address: "0xF9b6bE2bA8Da0DbF73bCb8df7C61aEaFb676704C", type: 0, location: "Maharashtra" }
    ];

    // We need to call functions sequentially or just batch them here
    for (const [index, party] of parties.entries()) {
        m.call(contract, "addNewParty", [
            party.name,
            party.address,
            party.type,
            party.location
        ], {
            id: `RegisterParty_${index}`
        });
    }

    return { contract };
});

export default RegisterPartiesModule;
