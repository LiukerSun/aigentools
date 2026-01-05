import jwt from 'jsonwebtoken';

const JWT_SECRET = 'a_very_secret_key';

const command = process.argv[2];
const arg = process.argv[3];

function printUsage() {
  console.log('Usage:');
  console.log(
    '  Generate Token: ts-node scripts/verify-jwt.ts generate [role]',
  );
  console.log('  Verify Token:   ts-node scripts/verify-jwt.ts verify [token]');
}

if (command === 'generate') {
  const role = arg || 'admin';
  const payload = {
    id: Math.floor(Math.random() * 1000),
    username: `${role}_user`,
    role: role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  console.log('\n=== Generated JWT ===');
  console.log(`Role: ${role}`);
  console.log(`Token: ${token}`);
  console.log('=====================\n');
} else if (command === 'verify') {
  if (!arg) {
    console.error('Error: Token is required for verification');
    printUsage();
    process.exit(1);
  }
  try {
    const decoded = jwt.verify(arg, JWT_SECRET);
    console.log('\n=== Token Verified ===');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('======================\n');
  } catch (err: any) {
    console.error('\n!!! Verification Failed !!!');
    console.error(err.message);
    console.log('===========================\n');
  }
} else {
  printUsage();
}
