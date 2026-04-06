import { describe, it, expect } from 'vitest';
import { CanvasLMS, CanvasLMSError, AuthenticationError, NotFoundError } from '../src/index.js';
import { createTestClient } from './helpers.js';

describe('CanvasLMS client', () => {
  it('constructs with env variables', () => {
    const client = createTestClient();
    expect(client.apiKey).toBeTruthy();
    expect(client.baseURL).toBeTruthy();
    expect(client.baseURL).not.toMatch(/\/$/);
  });

  it('throws when apiKey is missing', () => {
    const orig = process.env['CANVAS_API_KEY'];
    delete process.env['CANVAS_API_KEY'];
    try {
      expect(() => new CanvasLMS({ baseURL: 'https://example.com' })).toThrow(CanvasLMSError);
    } finally {
      process.env['CANVAS_API_KEY'] = orig;
    }
  });

  it('throws when baseURL is missing', () => {
    const orig = process.env['CANVAS_BASE_URL'];
    delete process.env['CANVAS_BASE_URL'];
    try {
      expect(() => new CanvasLMS({ apiKey: 'fake' })).toThrow(CanvasLMSError);
    } finally {
      process.env['CANVAS_BASE_URL'] = orig;
    }
  });

  it('strips trailing slash from baseURL', () => {
    const client = new CanvasLMS({
      apiKey: 'test',
      baseURL: 'https://canvas.example.com/',
    });
    expect(client.baseURL).toBe('https://canvas.example.com');
  });

  it('respects custom options', () => {
    const client = new CanvasLMS({
      apiKey: 'test',
      baseURL: 'https://canvas.example.com',
      timeout: 5000,
      maxRetries: 0,
      perPage: 50,
    });
    expect(client.timeout).toBe(5000);
    expect(client.maxRetries).toBe(0);
    expect(client.perPage).toBe(50);
  });

  it('exposes error classes statically', () => {
    expect(CanvasLMS.AuthenticationError).toBe(AuthenticationError);
    expect(CanvasLMS.NotFoundError).toBe(NotFoundError);
  });

  it('makes an authenticated API call', async () => {
    const client = createTestClient();
    const user = await client.users.getSelf();
    expect(user).toBeDefined();
    expect(user.id).toBeTruthy();
    expect(user.name).toBeTruthy();
  });

  it('returns raw Response via .asResponse()', async () => {
    const client = createTestClient();
    const response = await client.users.getSelf().asResponse();
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
  });

  it('returns data + response via .withResponse()', async () => {
    const client = createTestClient();
    const { data, response } = await client.users.getSelf().withResponse();
    expect(data.id).toBeTruthy();
    expect(response).toBeInstanceOf(Response);
    expect(response.ok).toBe(true);
  });

  it('throws NotFoundError for invalid resource', async () => {
    const client = createTestClient();
    await expect(client.courses.get(999999999)).rejects.toThrow(NotFoundError);
  });

  it('throws AuthenticationError for bad token', async () => {
    const client = new CanvasLMS({
      apiKey: 'invalid_token',
      baseURL: process.env['CANVAS_BASE_URL']!,
      maxRetries: 0,
    });
    await expect(client.users.getSelf()).rejects.toThrow(AuthenticationError);
  });
});
