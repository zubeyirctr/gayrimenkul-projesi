process.env.JWT_SECRET = 'test_secret_key';

jest.mock('../src/models/db', () => ({
  get: jest.fn(),
  run: jest.fn()
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const db     = require('../src/models/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { registerUser, loginUser } = require('../src/services/authService');

beforeEach(() => jest.clearAllMocks());

/* ===== registerUser ===== */
describe('registerUser', () => {
  it('creates and returns a new user on valid input', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password');
    db.run.mockImplementation(function (sql, params, cb) {
      cb.call({ lastID: 5 }, null);
    });

    const result = await registerUser('ali', 'ali@example.com', 'sifre123');
    expect(result).toMatchObject({ id: 5, username: 'ali', email: 'ali@example.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('sifre123', 10);
  });

  it('rejects when username is empty', async () => {
    await expect(registerUser('', 'test@test.com', 'password')).rejects.toThrow('zorunludur');
  });

  it('rejects when email is missing', async () => {
    await expect(registerUser('user', '', 'password')).rejects.toThrow('zorunludur');
  });

  it('rejects on invalid email format', async () => {
    await expect(registerUser('user', 'notanemail', 'password123')).rejects.toThrow('email formatı');
  });

  it('rejects when password is shorter than 6 characters', async () => {
    await expect(registerUser('user', 'user@test.com', '123')).rejects.toThrow('6 karakter');
  });

  it('rejects with a specific message when email is already in use', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    db.run.mockImplementation(function (sql, params, cb) {
      cb.call({}, new Error('UNIQUE constraint failed: users.email'));
    });
    await expect(registerUser('user2', 'dup@test.com', 'password123')).rejects.toThrow('email zaten kullanılıyor');
  });

  it('rejects with a specific message when username is already taken', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    db.run.mockImplementation(function (sql, params, cb) {
      cb.call({}, new Error('UNIQUE constraint failed: users.username'));
    });
    await expect(registerUser('existing', 'new@test.com', 'password123')).rejects.toThrow('kullanıcı adı zaten kullanılıyor');
  });
});

/* ===== loginUser ===== */
describe('loginUser', () => {
  it('returns a JWT token and user info on valid credentials', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser', password: 'hashed' };
    db.get.mockImplementation((sql, params, cb) => cb(null, mockUser));
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock.jwt.token');

    const result = await loginUser('test@test.com', 'correctpass');
    expect(result.token).toBe('mock.jwt.token');
    expect(result.user).toMatchObject({ id: 1, email: 'test@test.com', username: 'testuser' });
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, email: 'test@test.com', username: 'testuser' },
      'test_secret_key',
      { expiresIn: '1d' }
    );
  });

  it('rejects when email is not found in the database', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, null));
    await expect(loginUser('ghost@test.com', 'password')).rejects.toThrow('Email veya şifre hatalı');
  });

  it('rejects when password does not match', async () => {
    const mockUser = { id: 2, email: 'user@test.com', username: 'user', password: 'hashed' };
    db.get.mockImplementation((sql, params, cb) => cb(null, mockUser));
    bcrypt.compare.mockResolvedValue(false);
    await expect(loginUser('user@test.com', 'wrongpass')).rejects.toThrow('Email veya şifre hatalı');
  });

  it('rejects when email field is empty', async () => {
    await expect(loginUser('', 'password')).rejects.toThrow('zorunludur');
  });

  it('rejects when password field is empty', async () => {
    await expect(loginUser('user@test.com', '')).rejects.toThrow('zorunludur');
  });

  it('rejects on a database error', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(new Error('Connection lost'), null));
    await expect(loginUser('user@test.com', 'password')).rejects.toThrow('Connection lost');
  });
});
