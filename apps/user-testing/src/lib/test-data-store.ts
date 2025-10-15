// Shared in-memory storage for test results
// In production, this would be replaced with a database

class TestDataStore {
  private testResults = new Map<string, any[]>();
  private testConfigs = new Map<string, any>();

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
}

// Export a singleton instance
export const testDataStore = new TestDataStore();

