import bcrypt from 'bcryptjs';
const password = 'Admin1234$';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
