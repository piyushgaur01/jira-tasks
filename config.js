const config = {
  authHeader: 'Basic ', // your xxxxcom ID:PASSWORD in base64
  jiraUrl: 'https://jira.xxxx.com/',
  boardId: 10792, // Harman PGS Business Apps Board
  parent: {
    key: 'EN-XXXXXX', // Read from the user input now
    components: [],
    portfolioItems: [],
  },
  featureTasks: [
    'Analyze',
    'Develop',
    'Automation / Unit Test',
    'Peer Review',
    'Merge',
    'Test (QA)',
  ],
  defectTasks: [
    'Reproduce',
    'Resolve',
    'Automation / Unit Test',
    'Peer Review',
    'Merge',
    'Test (QA)',
  ],
};

module.exports = config;
