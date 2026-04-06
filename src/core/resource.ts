import type { CanvasLMS } from '../client.js';

export abstract class APIResource {
  protected _client: CanvasLMS;

  constructor(client: CanvasLMS) {
    this._client = client;
  }
}
