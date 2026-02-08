pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Whistleblower() {
    // Private inputs
    signal input name;
    signal input region;
    signal input account;
    signal input password;
    
    // Public inputs
    signal input merkleRoot;
    signal input regionHash;
    
    // Hash credentials using Poseidon
    component credHash = Poseidon(4);
    credHash.inputs[0] <== name;
    credHash.inputs[1] <== region;
    credHash.inputs[2] <== account;
    credHash.inputs[3] <== password;
    
    signal leaf;
    leaf <== credHash.out;
    
    // Verify leaf matches merkleRoot (simplified for demo)
    merkleRoot === leaf;
    
    // Verify region hash
    component rh = Poseidon(1);
    rh.inputs[0] <== region;
    rh.out === regionHash;
}

component main {public [merkleRoot, regionHash]} = Whistleblower();
