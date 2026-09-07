import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns ok when the database responds', async () => {
    const dataSource = { query: vi.fn().mockResolvedValue([{ '?column?': 1 }]) } as unknown as DataSource;
    const controller = new HealthController(dataSource);

    await expect(controller.check()).resolves.toEqual({ status: 'ok', database: 'up' });
  });

  it('throws when the database is unreachable', async () => {
    const dataSource = { query: vi.fn().mockRejectedValue(new Error('connection refused')) } as unknown as DataSource;
    const controller = new HealthController(dataSource);

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
