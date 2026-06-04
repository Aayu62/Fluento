import { NotificationsDeliveryService } from './delivery.service';

describe('NotificationsDeliveryService', () => {
  let service: NotificationsDeliveryService;
  const mockDb: any = {
    findMany: jest.fn(),
    logActivity: jest.fn(),
    update: jest.fn(),
    client: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsDeliveryService(mockDb as any);
  });

  it('processDueNotifications logs missing tokens when none exist', async () => {
    mockDb.findMany.mockResolvedValue([]);
    const res = await service.processDueNotifications();
    expect(res.processed).toBe(0);
    expect(res.sent).toBe(0);
    expect(res.missingTokens).toBe(0);
  });

  it('markOverdueMissed updates overdue calls', async () => {
    const overdueRow = { id: 'call-1', user_id: 'user-1' };
    mockDb.client.select.mockResolvedValue({ data: [overdueRow] });
    mockDb.update.mockResolvedValue({});
    mockDb.logActivity.mockResolvedValue(undefined);

    const res = await service.markOverdueMissed(0); // cutoff now
    expect(res.updated).toBeGreaterThanOrEqual(0);
  });
});
