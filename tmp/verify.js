import bcrypt from 'bcryptjs';
const password = 'Admin1234$';
const oldHash = '$2b$10$i./ZhulysEBxBw/rQcXOqekWe/yyKonsXFWbTECpu89oEKZqSS1l2';
const isMatch = bcrypt.compareSync(password, oldHash);
console.log('Match:', isMatch);
