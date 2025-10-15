// Shared in-memory storage for test results
// In production, this would be replaced with a database

export interface ScheduledJobData {
  id: string;
  companyId: string;
  testType: string;
  interval: string;
  nextRun: string; // ISO string
  lastRun?: string; // ISO string
  enabled: boolean;
  authToken: string;
  settings?: any;
}

class TestDataStore {
  private testResults = new Map<string, any[]>();
  private testConfigs = new Map<string, any>();
  private scheduledJobs = new Map<string, ScheduledJobData>();

  getResults(companyId: string): any[] {
    return this.testResults.get(companyId) || [];
  }

  addResult(companyId: string, result: any): void {
    const results = this.testResults.get(companyId) || [];
    results.unshift(result); // Add to beginning
    
    // Keep only last 1000 results
    if (results.length > 1000) {
      results.pop();
    }

    this.testResults.set(companyId, results);
  }

  getConfig(companyId: string): any {
    return this.testConfigs.get(companyId);
  }

  setConfig(companyId: string, config: any): void {
    this.testConfigs.set(companyId, config);
  }

  // Scheduled job management
  getScheduledJob(jobId: string): ScheduledJobData | undefined {
    return this.scheduledJobs.get(jobId);
  }

  setScheduledJob(jobId: string, job: ScheduledJobData): void {
    this.scheduledJobs.set(jobId, job);
  }

  deleteScheduledJob(jobId: string): void {
    this.scheduledJobs.delete(jobId);
  }

  getAllScheduledJobs(): ScheduledJobData[] {
    return Array.from(this.scheduledJobs.values());
  }

  getCompanyScheduledJobs(companyId: string): ScheduledJobData[] {
    return Array.from(this.scheduledJobs.values()).filter(
      job => job.companyId === companyId
    );
  }
}

// Export a singleton instance
export const testDataStore = new TestDataStore();

