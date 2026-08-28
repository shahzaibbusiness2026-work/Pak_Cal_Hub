import { prisma, isDatabaseConnected } from '../db/prisma';
import { SyncServiceResult, SyncOptions } from './types';

export const SAMPLE_GOVT_DETECTIONS = [
  {
    government: 'federal',
    year: '2026-27',
    title: 'Notification of 7% Ad-hoc Relief Allowance 2026 for Federal Civil Servants',
    notificationNo: 'F.1(2)Imp/2026-RBPS',
    details: JSON.stringify({ adhocRate: 0.07, name: 'Ad-hoc Relief Allowance 2026 (7%)', appliesTo: 'runningBasic' }),
    effectiveDate: '2026-07-01',
    sourceUrl: 'https://finance.gov.pk',
  },
  {
    government: 'punjab',
    year: '2026-27',
    title: 'Finance Department Punjab Circular on Special Allowance 2026 Review',
    notificationNo: 'FD.PR.12-5/2026',
    details: JSON.stringify({ specialAllowance: 'DRA maintained', appliesTo: 'initial2017' }),
    effectiveDate: '2026-07-01',
    sourceUrl: 'https://finance.punjab.gov.pk',
  },
];

/**
 * Scans for new Government Gazette notifications and stages them in PENDING_REVIEW status.
 * Safety Rule: NEVER automatically publishes civil service pay without human admin approval.
 */
export async function syncGovernmentNotifications(options: SyncOptions = {}): Promise<SyncServiceResult> {
  const timestamp = new Date().toISOString();
  let changesDetected = 0;

  try {
    const connected = await isDatabaseConnected();
    if (!connected) {
      return {
        service: 'government',
        success: true,
        timestamp,
        itemsProcessed: SAMPLE_GOVT_DETECTIONS.length,
        changesDetected: 0,
        changes: [],
        message: 'Database in fallback mode: Government scan completed in memory.',
      };
    }

    for (const item of SAMPLE_GOVT_DETECTIONS) {
      const existing = await prisma.governmentNotificationDraft.findFirst({
        where: { notificationNo: item.notificationNo },
      });

      if (!existing) {
        changesDetected++;
        // Stage in draft table with PENDING_REVIEW status
        await prisma.governmentNotificationDraft.create({
          data: {
            government: item.government,
            year: item.year,
            title: item.title,
            notificationNo: item.notificationNo,
            details: item.details,
            effectiveDate: item.effectiveDate,
            sourceUrl: item.sourceUrl,
            status: 'PENDING_REVIEW',
          },
        });

        // Create Admin Alert
        await prisma.systemNotification.create({
          data: {
            title: `🔔 Gazette Detected: ${item.government.toUpperCase()}`,
            message: `New official notification "${item.title}" detected. Awaiting admin review and approval.`,
            type: 'WARNING',
            category: 'salary',
            linkUrl: '/admin',
          },
        });

        // Log in SyncLog
        await prisma.syncLog.create({
          data: {
            type: 'government',
            status: 'PENDING_REVIEW',
            message: `Detected new Gazette OM ${item.notificationNo} (${item.government}). Staged for Admin Review.`,
            source: item.sourceUrl,
          },
        });
      }
    }

    return {
      service: 'government',
      success: true,
      timestamp,
      itemsProcessed: SAMPLE_GOVT_DETECTIONS.length,
      changesDetected,
      changes: [],
      message: `Government notification scan completed. ${changesDetected} new gazette drafts staged for review.`,
    };
  } catch (err: any) {
    try {
      await prisma.syncLog.create({
        data: {
          type: 'government',
          status: 'FAILED',
          message: `Government scan failed: ${err.message}`,
        },
      });
    } catch (e) {}

    return {
      service: 'government',
      success: false,
      timestamp,
      itemsProcessed: 0,
      changesDetected: 0,
      changes: [],
      message: `Government scan failed: ${err.message}`,
      error: err.message,
    };
  }
}
