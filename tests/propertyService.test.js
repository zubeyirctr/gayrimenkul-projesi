jest.mock('../src/models/db', () => ({
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
}));

const db = require('../src/models/db');
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../src/services/propertyService');

beforeEach(() => jest.clearAllMocks());

/* ===== getAllProperties ===== */
describe('getAllProperties', () => {
  it('returns properties belonging to the given user', async () => {
    const rows = [{ id: 1, title: 'Daire', price: 500000, type: 'Satılık', location: 'İstanbul', user_id: 1 }];
    db.all.mockImplementation((sql, params, cb) => cb(null, rows));

    const result = await getAllProperties(1);
    expect(result).toEqual(rows);
    expect(db.all).toHaveBeenCalledWith('SELECT * FROM properties WHERE user_id = ?', [1], expect.any(Function));
  });

  it('rejects on database error', async () => {
    db.all.mockImplementation((sql, params, cb) => cb(new Error('DB error'), null));
    await expect(getAllProperties(1)).rejects.toThrow('DB error');
  });
});

/* ===== getPropertyById ===== */
describe('getPropertyById', () => {
  it('returns the property when user matches', async () => {
    const prop = { id: 3, title: 'Villa', price: 2000000, type: 'Satılık', location: 'Bodrum', user_id: 7 };
    db.get.mockImplementation((sql, params, cb) => cb(null, prop));

    const result = await getPropertyById(3, 7);
    expect(result).toEqual(prop);
  });

  it('rejects with "Mülk bulunamadı" when row is null', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, null));
    await expect(getPropertyById(99, 1)).rejects.toThrow('Mülk bulunamadı');
  });

  it('rejects with access error when user_id does not match', async () => {
    const prop = { id: 1, title: 'Ev', price: 300000, type: 'Kiralık', location: 'Ankara', user_id: 5 };
    db.get.mockImplementation((sql, params, cb) => cb(null, prop));
    await expect(getPropertyById(1, 99)).rejects.toThrow('erişim yetkiniz yok');
  });

  it('rejects on database error', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(new Error('Connection lost'), null));
    await expect(getPropertyById(1, 1)).rejects.toThrow('Connection lost');
  });
});

/* ===== createProperty ===== */
describe('createProperty', () => {
  it('creates and returns the new property with user_id', async () => {
    db.run.mockImplementation(function (sql, params, cb) {
      cb.call({ lastID: 42 }, null);
    });

    const result = await createProperty({ title: 'Bahçeli Ev', price: 750000, type: 'Satılık', location: 'İzmir' }, 3);
    expect(result).toMatchObject({ id: 42, title: 'Bahçeli Ev', price: 750000, user_id: 3 });
  });

  it('rejects when a required field is missing', async () => {
    await expect(createProperty({ title: '', price: 100000, type: 'Satılık', location: 'İzmir' }, 1))
      .rejects.toThrow('zorunludur');
  });

  it('rejects when price is zero', async () => {
    await expect(createProperty({ title: 'Ev', price: 0, type: 'Satılık', location: 'İzmir' }, 1))
      .rejects.toThrow("0'dan büyük");
  });

  it('rejects when price is negative', async () => {
    await expect(createProperty({ title: 'Ev', price: -500, type: 'Kiralık', location: 'Bursa' }, 1))
      .rejects.toThrow("0'dan büyük");
  });

  it('rejects on database error', async () => {
    db.run.mockImplementation(function (sql, params, cb) {
      cb.call({}, new Error('Insert failed'));
    });
    await expect(createProperty({ title: 'Test', price: 100, type: 'Satılık', location: 'İzmir' }, 1))
      .rejects.toThrow('Insert failed');
  });
});

/* ===== updateProperty ===== */
describe('updateProperty', () => {
  it('updates and returns the property', async () => {
    const existing = { id: 1, title: 'Eski Başlık', price: 100, type: 'Satılık', location: 'İzmir', user_id: 1 };
    db.get.mockImplementation((sql, params, cb) => cb(null, existing));
    db.run.mockImplementation(function (sql, params, cb) { cb.call({}, null); });

    const result = await updateProperty(1, { title: 'Yeni Başlık', price: 999, type: 'Kiralık', location: 'Ankara' }, 1);
    expect(result.title).toBe('Yeni Başlık');
    expect(result.price).toBe(999);
    expect(result.user_id).toBe(1);
  });

  it('rejects when property does not exist', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, null));
    await expect(updateProperty(99, { title: 'X', price: 1, type: 'Satılık', location: 'Y' }, 1))
      .rejects.toThrow('Mülk bulunamadı');
  });

  it('rejects when user is not the owner', async () => {
    const existing = { id: 1, title: 'Ev', price: 100, type: 'Satılık', location: 'İzmir', user_id: 5 };
    db.get.mockImplementation((sql, params, cb) => cb(null, existing));
    await expect(updateProperty(1, { title: 'X', price: 1, type: 'Satılık', location: 'Y' }, 99))
      .rejects.toThrow('erişim yetkiniz yok');
  });
});

/* ===== deleteProperty ===== */
describe('deleteProperty', () => {
  it('deletes the property and returns a success message', async () => {
    const existing = { id: 2, title: 'Arsa', price: 800000, type: 'Satılık', location: 'Antalya', user_id: 4 };
    db.get.mockImplementation((sql, params, cb) => cb(null, existing));
    db.run.mockImplementation(function (sql, params, cb) { cb.call({}, null); });

    const result = await deleteProperty(2, 4);
    expect(result).toEqual({ message: 'Mülk silindi' });
  });

  it('rejects when property is not found', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, null));
    await expect(deleteProperty(999, 1)).rejects.toThrow('Mülk bulunamadı');
  });

  it('rejects when user is not the owner', async () => {
    const existing = { id: 1, title: 'Ofis', price: 50000, type: 'Kiralık', location: 'Eskişehir', user_id: 3 };
    db.get.mockImplementation((sql, params, cb) => cb(null, existing));
    await expect(deleteProperty(1, 99)).rejects.toThrow('erişim yetkiniz yok');
  });
});
