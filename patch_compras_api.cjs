const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /importando/g; // Not used actually

// Make sure that whenever a PO is imported/created, a receiving is added. Oh wait, I already did this!
