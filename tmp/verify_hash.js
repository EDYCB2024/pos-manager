import bcrypt from 'bcryptjs';

const password = 'Admin1234$';
const hash = '$2b$10$i./ZhulysEBxBw/rQcXOqekWe/yyKonsXFWbTECpu89oEKZqSS1l2';

async function check() {
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password match:', isMatch);
}

check();
