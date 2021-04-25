const axios = require('axios');
const logger = require('./logger');
const config = require('./config');

function done() {
  console.log('Report printed, check app.log under /logs.');
}

// Sprint IDs: Sprint 10: 12447, Sprint 11: 12448, Sprint 12: 12500, Sprint 13: 12501
const activeSprint = 12500; // Change sprint ID accordingly

function getIssues(callback) {
  const request = {
    method: 'GET',
    url: `${config.jiraUrl}/rest/api/2/search?jql=assignee+%3D+currentUser()+AND+status+not+in+(TrashCan)+AND+Sprint=${activeSprint}+ORDER+BY+cf[10004]+ASC`,
    headers: {
      Authorization: config.authHeader,
      'Content-Type': 'application/json',
    },
  };

  axios(request)
    .then((result) => {
      logger.info(`Get Issues Request || Status: ${result.status}`);
      const { issues } = result.data;
      callback(issues, done);
    })
    .catch((err) => {
      logger.error(`Some error occured: ${err}`);
      process.exit(1);
    });
}

function printReport(issues, cb) {
  const reportData = {};
  issues.forEach((issue) => {
    if (issue.fields.issuetype.id === '5') { // a subtask
      if (!reportData[`${issue.fields.parent.key}`]) {
        reportData[`${issue.fields.parent.key}`] = {
          status: issue.fields.parent.fields.status.name,
          summary: issue.fields.parent.fields.summary,
          subTasks: [],
        };
      }

      reportData[`${issue.fields.parent.key}`].subTasks.push({
        key: issue.key,
        status: issue.fields.status.name,
        summary: issue.fields.summary,
      });
    } else if (!reportData[`${issue.key}`]) {
      reportData[`${issue.key}`] = {};
      reportData[`${issue.key}`].status = issue.fields.status.name;
      reportData[`${issue.key}`].summary = issue.fields.summary;
      reportData[`${issue.key}`].subTasks = [];
    }
  });
  let output = '';
  Object.keys(reportData).forEach((parentKey) => {
    output += `
* **${reportData[parentKey].summary.split('-')[0].trim()}** [${parentKey}](https://jira.xxxx.com/browse/${parentKey}) **Dev** - ${reportData[parentKey].summary} ${reportData[parentKey].status === 'Done' ? '✅' : ''}
`;
    reportData[parentKey].subTasks.forEach((subTask) => {
      output += ` * [${subTask.summary}](https://jira.xxxx.com/browse/${subTask.key}) ${subTask.status === 'Done' ? '✅' : ''}

`;
    });
  });
  logger.info(output);
  cb();
}

getIssues(printReport);
