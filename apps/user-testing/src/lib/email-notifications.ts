import { TestResult, EmailNotification, TEST_DEFINITIONS } from '@/types/test-config';

export async function sendTestNotification(
  recipients: string[],
  results: TestResult[]
): Promise<void> {
  const summary = {
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    total: results.length,
  };

  const notification: EmailNotification = {
    to: recipients.join(', '),
    subject: `Fluid Test Results: ${summary.passed}/${summary.total} Passed`,
    testResults: results,
    summary,
  };

  // Send email via API
  await fetch('/api/tests/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
}

export function generateEmailHTML(notification: EmailNotification): string {
  const { testResults, summary } = notification;
  const successRate = (summary.passed / summary.total) * 100;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .summary {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.success {
      background-color: #d1fae5;
      border: 2px solid #10b981;
    }
    .summary-card.failed {
      background-color: #fee2e2;
      border: 2px solid #ef4444;
    }
    .summary-card.total {
      background-color: #e0e7ff;
      border: 2px solid #6366f1;
    }
    .summary-card .number {
      font-size: 36px;
      font-weight: bold;
      margin: 0;
    }
    .summary-card .label {
      font-size: 14px;
      margin: 5px 0 0 0;
      opacity: 0.8;
    }
    .test-result {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .test-result.passed {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
    .test-result.failed {
      border-color: #ef4444;
      background-color: #fef2f2;
    }
    .test-result h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .test-result .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .test-result .status.passed {
      background-color: #10b981;
      color: white;
    }
    .test-result .status.failed {
      background-color: #ef4444;
      color: white;
    }
    .test-steps {
      margin-top: 15px;
      padding: 15px;
      background-color: white;
      border-radius: 6px;
    }
    .test-step {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    .test-step:last-child {
      border-bottom: none;
    }
    .test-step.passed {
      color: #059669;
    }
    .test-step.failed {
      color: #dc2626;
    }
    .error {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 12px;
      margin-top: 10px;
      border-radius: 4px;
      font-size: 14px;
      color: #991b1b;
    }
    .footer {
      margin-top: 40px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 15px 0;
    }
    .progress-bar-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .progress-bar-fill.success {
      background-color: #10b981;
    }
    .progress-bar-fill.warning {
      background-color: #f59e0b;
    }
    .progress-bar-fill.danger {
      background-color: #ef4444;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 Fluid Automated Test Results</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="summary-card success">
      <p class="number">${summary.passed}</p>
      <p class="label">Passed</p>
    </div>
    <div class="summary-card failed">
      <p class="number">${summary.failed}</p>
      <p class="label">Failed</p>
    </div>
    <div class="summary-card total">
      <p class="number">${summary.total}</p>
      <p class="label">Total</p>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Success Rate</p>
    <p style="margin: 0; font-size: 32px; font-weight: bold; color: ${successRate >= 90 ? '#10b981' : successRate >= 70 ? '#f59e0b' : '#ef4444'};">
      ${successRate.toFixed(1)}%
    </p>
    <div class="progress-bar">
      <div class="progress-bar-fill ${successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'danger'}" 
           style="width: ${successRate}%;"></div>
    </div>
  </div>

  ${testResults.map(result => `
    <div class="test-result ${result.status}">
      <h3>${TEST_DEFINITIONS[result.testType].name}</h3>
      <span class="status ${result.status}">${result.status.toUpperCase()}</span>
      <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">
        Duration: ${result.duration ? (result.duration / 1000).toFixed(2) : 0}s
      </p>

      ${result.error ? `
        <div class="error">
          <strong>Error:</strong> ${result.error}
        </div>
      ` : ''}

      <div class="test-steps">
        <strong style="font-size: 14px; color: #374151;">Test Steps:</strong>
        ${result.steps.map(step => `
          <div class="test-step ${step.status}">
            <span style="font-weight: bold;">${step.status === 'passed' ? '✓' : '✗'}</span>
            ${step.name}
            <span style="color: #9ca3af;">(${(step.duration / 1000).toFixed(2)}s)</span>
            ${step.error ? `<br/><span style="color: #dc2626; font-size: 12px;">→ ${step.error}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}

  <div class="footer">
    <p style="margin: 0;">
      This is an automated notification from Fluid Automated Testing.<br/>
      Tests run automatically based on your configured schedule.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function generateEmailText(notification: EmailNotification): string {
  const { testResults, summary } = notification;
  const successRate = (summary.passed / summary.total) * 100;

  let text = `Fluid Automated Test Results\n`;
  text += `${new Date().toLocaleString()}\n`;
  text += `${'='.repeat(60)}\n\n`;
  
  text += `SUMMARY\n`;
  text += `-------\n`;
  text += `Passed: ${summary.passed}\n`;
  text += `Failed: ${summary.failed}\n`;
  text += `Total: ${summary.total}\n`;
  text += `Success Rate: ${successRate.toFixed(1)}%\n\n`;

  text += `TEST RESULTS\n`;
  text += `------------\n\n`;

  testResults.forEach(result => {
    text += `${TEST_DEFINITIONS[result.testType].name}\n`;
    text += `Status: ${result.status.toUpperCase()}\n`;
    text += `Duration: ${result.duration ? (result.duration / 1000).toFixed(2) : 0}s\n`;
    
    if (result.error) {
      text += `Error: ${result.error}\n`;
    }

    text += `\nSteps:\n`;
    result.steps.forEach(step => {
      const icon = step.status === 'passed' ? '✓' : '✗';
      text += `  ${icon} ${step.name} (${(step.duration / 1000).toFixed(2)}s)\n`;
      if (step.error) {
        text += `    → ${step.error}\n`;
      }
    });

    text += `\n${'-'.repeat(60)}\n\n`;
  });

  text += `This is an automated notification from Fluid Automated Testing.\n`;
  
  return text;
}

