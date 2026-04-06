import { describe, it, expect } from 'vitest';
import { createTestClient } from './helpers.js';

describe('Users resource', () => {
  const client = createTestClient();

  it('getSelf() returns the current user', async () => {
    const user = await client.users.getSelf();
    expect(user.id).toBeTruthy();
    expect(user.name).toBeTruthy();
    expect(typeof user.name).toBe('string');
  });

  it('get() returns a user by ID', async () => {
    const self = await client.users.getSelf();
    const user = await client.users.get(self.id);
    expect(user.id).toEqual(self.id);
    expect(user.name).toEqual(self.name);
  });
});
