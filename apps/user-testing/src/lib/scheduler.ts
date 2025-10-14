import { ScheduleInterval, TestConfig, TestType } from '@/types/test-config';

export interface ScheduledJob {
  id: string;
  companyId: string;
  testType: TestType;
  interval: ScheduleInterval;
  nextRun: Date;
  lastRun?: Date;
  enabled: boolean;
  authToken: string;
  settings?: any;
}

class TestScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule a test to run at specified intervals
   */
  scheduleTest(
    companyId: string,
    testType: TestType,
    interval: ScheduleInterval,
    authToken: string,
    settings?: any
  ): void {
    const jobId = this.getJobId(companyId, testType);

    // Clear existing job if any
    this.clearJob(jobId);

    const job: ScheduledJob = {
      id: jobId,
      companyId,
      testType,
      interval,
      nextRun: this.calculateNextRun(interval),
      enabled: true,
      authToken,
      settings,
    };

    this.jobs.set(jobId, job);

    // Schedule the recurring job
    this.scheduleNextRun(job);
  }

  /**
   * Cancel a scheduled test
   */
  cancelTest(companyId: string, testType: TestType): void {
    const jobId = this.getJobId(companyId, testType);
    this.clearJob(jobId);
  }

  /**
   * Get all scheduled jobs for a company
   */
  getCompanyJobs(companyId: string): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.companyId === companyId
    );
  }

  /**
   * Update multiple test schedules from config
   */
  updateFromConfig(
    companyId: string,
    configs: TestConfig[],
    authToken: string
  ): void {
    // Cancel all existing jobs for this company
    const existingJobs = this.getCompanyJobs(companyId);
    existingJobs.forEach(job => this.clearJob(job.id));

    // Schedule enabled tests
    configs
      .filter(config => config.enabled)
      .forEach(config => {
        this.scheduleTest(companyId, config.id, config.schedule, authToken, config.settings);
      });
  }

  private scheduleNextRun(job: ScheduledJob): void {
    const delay = job.nextRun.getTime() - Date.now();

    const timer = setTimeout(async () => {
      try {
        // Execute the test
        await this.executeTest(job);

        // Update job
        job.lastRun = new Date();
        job.nextRun = this.calculateNextRun(job.interval);
        this.jobs.set(job.id, job);

        // Schedule next run
        if (job.enabled) {
          this.scheduleNextRun(job);
        }
      } catch (error) {
        console.error(`Scheduled test execution failed for ${job.id}:`, error);
        
        // Retry by scheduling next run anyway
        job.nextRun = this.calculateNextRun(job.interval);
        this.jobs.set(job.id, job);
        
        if (job.enabled) {
          this.scheduleNextRun(job);
        }
      }
    }, delay);

    this.timers.set(job.id, timer);
  }

  private async executeTest(job: ScheduledJob): Promise<void> {
    console.log(`Executing scheduled test: ${job.testType} for company ${job.companyId}`);

    // Call the test runner API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testType: job.testType,
        companySubdomain: job.companyId,
        authToken: job.authToken,
        settings: job.settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`Test execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Save result
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/tests/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: job.companyId,
        result,
      }),
    });

    // Send notification if configured
    const configResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/tests/config?companyId=${job.companyId}`
    );
    
    if (configResponse.ok) {
      const config = await configResponse.json();
      if (config.emailNotifications?.enabled && config.emailNotifications?.recipients?.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/tests/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: config.emailNotifications.recipients.join(', '),
            subject: `Scheduled Test: ${result.status === 'passed' ? '✓' : '✗'} ${job.testType}`,
            testResults: [result],
            summary: {
              passed: result.status === 'passed' ? 1 : 0,
              failed: result.status === 'failed' ? 1 : 0,
              total: 1,
            },
          }),
        });
      }
    }
  }

  private calculateNextRun(interval: ScheduleInterval): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (interval) {
      case '30min':
        nextRun.setMinutes(nextRun.getMinutes() + 30);
        break;
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1);
        break;
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'every-other-day':
        nextRun.setDate(nextRun.getDate() + 2);
        break;
    }

    return nextRun;
  }

  private clearJob(jobId: string): void {
    const timer = this.timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(jobId);
    }
    this.jobs.delete(jobId);
  }

  private getJobId(companyId: string, testType: TestType): string {
    return `${companyId}::${testType}`;
  }

  /**
   * Clear all jobs (useful for cleanup)
   */
  clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.jobs.clear();
  }

  /**
   * Get job status
   */
  getJobStatus(companyId: string, testType: TestType): ScheduledJob | null {
    const jobId = this.getJobId(companyId, testType);
    return this.jobs.get(jobId) || null;
  }
}

// Singleton instance
export const testScheduler = new TestScheduler();

