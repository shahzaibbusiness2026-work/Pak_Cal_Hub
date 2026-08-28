import { NextResponse, NextRequest } from 'next/server';
import { prisma, isDatabaseConnected } from '../../../../lib/db/prisma';
import { syncFuelPrices } from '../../../../lib/sync/fuel';
import { syncGoldRates } from '../../../../lib/sync/gold';
import { syncCurrencyRates } from '../../../../lib/sync/currency';
import { syncElectricityTariffs } from '../../../../lib/sync/electricity';
import { syncGovernmentNotifications } from '../../../../lib/sync/government';
import { syncAllServices } from '../../../../lib/sync';

export async function GET(req: NextRequest) {
  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return NextResponse.json({
        success: true,
        connected: false,
        stats: {
          totalSyncs: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          pendingDrafts: 0,
          unreadNotifications: 0,
          lastSyncTime: 'Hybrid Fallback Mode Active',
        },
        logs: [],
        drafts: [],
        notifications: [],
      });
    }

    const [logs, drafts, notifications, successCount, failedCount] = await Promise.all([
      prisma.syncLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.governmentNotificationDraft.findMany({ orderBy: { detectedAt: 'desc' }, take: 10 }),
      prisma.systemNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.syncLog.count({ where: { status: 'SUCCESS' } }),
      prisma.syncLog.count({ where: { status: 'FAILED' } }),
    ]);

    const pendingDraftsCount = await prisma.governmentNotificationDraft.count({
      where: { status: 'PENDING_REVIEW' },
    });

    const unreadNotificationsCount = await prisma.systemNotification.count({
      where: { isRead: false },
    });

    const lastLog = logs[0];

    return NextResponse.json({
      success: true,
      connected: true,
      stats: {
        totalSyncs: successCount + failedCount,
        successfulSyncs: successCount,
        failedSyncs: failedCount,
        pendingDrafts: pendingDraftsCount,
        unreadNotifications: unreadNotificationsCount,
        lastSyncTime: lastLog ? lastLog.createdAt.toISOString() : 'Never',
      },
      logs,
      drafts,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, service, draftId, secretKey, adminUser } = body;

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'pakcalc2026';
    if (secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
    }

    const user = adminUser || 'Admin Portal';

    // 1. On-Demand Sync Trigger
    if (action === 'TRIGGER_SYNC') {
      let result;
      if (service === 'fuel') result = await syncFuelPrices({ adminUser: user, forceUpdate: true });
      else if (service === 'gold') result = await syncGoldRates({ adminUser: user, forceUpdate: true });
      else if (service === 'currency') result = await syncCurrencyRates({ adminUser: user, forceUpdate: true });
      else if (service === 'electricity') result = await syncElectricityTariffs({ adminUser: user, forceUpdate: true });
      else if (service === 'government') result = await syncGovernmentNotifications({ adminUser: user });
      else result = await syncAllServices({ adminUser: user, forceUpdate: true });

      return NextResponse.json({ success: true, result });
    }

    // 2. Approve Government Notification Draft
    if (action === 'APPROVE_GOVT_DRAFT') {
      if (!draftId) return NextResponse.json({ success: false, error: 'draftId is required' }, { status: 400 });

      const updatedDraft = await prisma.governmentNotificationDraft.update({
        where: { id: draftId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: user,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          action: 'APPROVE_GOVT_DRAFT',
          targetTable: 'GovernmentNotificationDraft',
          details: `Approved Government Gazette OM: ${updatedDraft.notificationNo} (${updatedDraft.government}) by ${user}`,
          adminUser: user,
        },
      });

      return NextResponse.json({ success: true, draft: updatedDraft });
    }

    // 3. Reject Government Notification Draft
    if (action === 'REJECT_GOVT_DRAFT') {
      if (!draftId) return NextResponse.json({ success: false, error: 'draftId is required' }, { status: 400 });

      const updatedDraft = await prisma.governmentNotificationDraft.update({
        where: { id: draftId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: user,
        },
      });

      return NextResponse.json({ success: true, draft: updatedDraft });
    }

    // 4. Dismiss Notification
    if (action === 'DISMISS_NOTIFICATION') {
      const { notificationId } = body;
      if (notificationId) {
        await prisma.systemNotification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action requested' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
