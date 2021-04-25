/* eslint-disable comma-dangle */
const axios = require('axios');
const async = require('async');
const prompt = require('prompt');
const logger = require('./logger');
const config = require('./config');

function startLog() {
  logger.info('****************************************');
  logger.info('    Sub Tasks creation in progress!     ');
  logger.info('****************************************');
}

function endLog() {
  logger.info('****************************************');
  logger.info('       END OF SUB-TASKS CREATION!       ');
  logger.info('****************************************');
}

function createSubTask(parent, subTask, callback) {
  const request = {
    method: 'POST',
    url: 'https://jira.xxxx.com/rest/api/2/issue',
    data: {
      fields: {
        parent: { key: parent.key },
        project: { id: 12500 }, // 12500 => ENGINEERING
        summary: subTask,
        assignee: {
          name: ['Peer Review', 'Merge', 'Test (QA)'].includes(subTask) ? 'vkushwaha' : 'pgaur',
        },
        issuetype: { id: 10101 }, // 10101 => Sub-Task
        description: '',
        components: parent.components.map(obj => ({ id: obj.id })),
        customfield_11837: parent.portfolioItems.map(obj => ({ id: obj.id })),
      },
    },
    headers: {
      Authorization: config.authHeader,
      'Content-Type': 'application/json',
    },
  };

  logger.info(`Creating Subtask: ${subTask}`);

  // callback(); // --> comment this line and uncomment below axios request

  axios(request)
    .then((result) => {
      logger.info(`Status: ${result.status} Key: ${result.data.key} | Id: ${result.data.id}`);
      callback();
    })
    .catch((err) => {
      logger.error(`Some error occured: ${err}`);
      process.exit(1);
    });
}

function getParentDetails(id) {
  const request = {
    method: 'GET',
    url: `https://jira.xxxx.com/rest/api/2/issue/${id}`,
    headers: {
      Authorization: config.authHeader,
    },
  };
  return axios(request);
}

const promptAttributes = [
  {
    name: 'issueId',
    description: 'Enter JIRA Issue Id (in the form EN-XXXXXX): ',
    validator: /^EN-\d+$/,
    required: true,
    warning: 'Issue ID is not valid. Eg. of valid issue id - EN-117339'
  },
];
// Start the prompt to read user input.
prompt.start();
// Prompt and get user input then display those data in console.
prompt.get(promptAttributes, (err, input) => {
  if (err) {
    logger.error('Error while reading input: ', err);
    return 1;
  }
  // Get user input from result object.
  const { issueId } = input;
  logger.info(`Issue ID: ${issueId}`);

  config.parent.key = issueId;

  getParentDetails(config.parent.key)
    .then((result) => {
      logger.info(`Status: ${result.status} | Parent Key: ${result.data.key} | Issue Type: ${result.data.fields.issuetype.name}`);
      config.parent.components = result.data.fields.components;
      config.parent.portfolioItems = result.data.fields.customfield_11837;
      if (result.data.fields.issuetype.name === 'Defect') {
        logger.info('Issue type is Defect');
        async.eachSeries(config.defectTasks, (subTask, cb) => {
          setTimeout(createSubTask, 300, config.parent, subTask, cb);
        }, endLog);
      } else {
        logger.info('Issue type is either Story or Task');
        startLog();
        async.eachSeries(config.featureTasks, (subTask, cb) => {
          setTimeout(createSubTask, 300, config.parent, subTask, cb);
        }, endLog);
      }
    })
    .catch((error) => {
      logger.error('Error while fetching parent details: ', error);
      process.exit(1);
    });
  return 0;
});
