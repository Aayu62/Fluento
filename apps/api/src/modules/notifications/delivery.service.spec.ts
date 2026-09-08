import { NotificationsDeliveryService } from './delivery.service';

describe('NotificationsDeliveryService', () => {
  let service: NotificationsDeliveryService;
  let mockDb: Record<string, unknown>;

  beforeEach(() => {
    mockDb = {
      findMany: jest.fn().mockResolvedValue([]),
      logActivity: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue({}),
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: [] }),
      },
    };
    service = new NotificationsDeliveryService(mockDb as any);
  });

  it('processDueNotifications returns zero when no due calls exist', async () => {
    const res = await service.processDueNotifications();
    expect(res.processed).toEqual(0);
    expect(res.sent).toEqual(0);
    expect(res.missingTokens).toEqual(0);
  });

  it('markOverdueMissed updates overdue call records', async () => {
    const res = await service.markOverdueMissed(0);
    expect(res.updated).toEqual(0);
  });
});
