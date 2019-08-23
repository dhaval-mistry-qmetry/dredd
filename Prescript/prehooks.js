const hooks = require('hooks');
const fs = require('fs');
var responseStash = [];
const PropertiesReader = require('properties-reader');  //npm install properties-reader --save

clearFile();



var apikey = "yI2E1tCYzEnBhkn4IaCKxNi9tOTqZKqr1oe26vOK"; //WiSIzvI9om7sIQm6DG4ihWvn8IeXo97rphgqcYBy
var automationApiKey = "T6xAt3jIPixedieNvbWq2jN3AbqkpHXL5ZJlUMnu"; //tquuiFVmsYmuGSuM2zYMXEdDTvhfgzSvskqAVTIc
var demoFileForAttachment = "./TEST-com.examples.ex2.AppTest.xml";
var project = 7128;

var userForArchieveDelete;
var projectId;
var releaseIdForArchive;
var paramIdForDatagrid;
var paramIdForDatagrid1;
var rqParentFolderId;
var rqLinkReleaseId;
var rqLinkCycleId;
var issueTypeId;
var issuePriorityId;
var userOwnerId;
var rqComponentId;
var testcaseParentFolderId;
var testcasePriorityId;
var testcaseComponentId;
var testcaseStateId;
var testcaseTypeId;
var testcaseTestingTypeId;
var rqPriorityId;
var rqStateId;
var testsuiteParentFolderId;
var testsuiteStateId;
var rqLinkTestcaseId;
var rqLinkIssueId;
var rqLinkTestcaseVersionId;
var testcaseViewId;
var issueTestcaseRunId;
var testcaseTcTsId;
var executionTestcaseStepRunViewId;
var testsuiteLinkPlatformId;
var testcaseTestsuiteId;
var testsuiteRunId;
var testsuiteDropId;
var importTestsuiteId;

var rqIdVersionDelete;
var testcaseIdDeleteForVersionDelete;
var testcaseVersionIdDeleteForVersionDelete;

var testcaseRequirementIdLink;
var testcaseRequirementKeyLink;
var testcaseRequirementVersionIdLink;

// Random values - Not required to update.
var paramNameRandom1 = "Param Name " + Math.random().toString(36).substring(7);
var paramDescriptionRandom1 = "Param Description " + Math.random().toString(36).substring(7);
var paramNameRandom2 = "Param Name " + Math.random().toString(36).substring(7);
var paramDescriptionRandom2 = "Param Description " + Math.random().toString(36).substring(7);
var paramNameRandom3 = "Param Name " + Math.random().toString(36).substring(7);
var paramDescriptionRandom3 = "Param Description " + Math.random().toString(36).substring(7);

var datagridNameRandom = "Datagrid Name " + Math.random().toString(36).substring(7);

var requirementFolderNameRandom = "Req Folder " + Math.random().toString(36).substring(7);
var testcaseFolderNameRandom = "Testcase Folder " + Math.random().toString(36).substring(7);
var testsuiteFolderNameRandom = "Testsuited Folder " + Math.random().toString(36).substring(7);
var testsuiteSummaryRandom = "Testsuite Summary " + Math.random().toString(36).substring(7);
var testsuiteSummaryImportRandom = "Testsuite Summary Import " + Math.random().toString(36).substring(7);
var testsuiteSummaryOpsRandom = "Testsuite Summary Ops " + Math.random().toString(36).substring(7);

var projectKey1 = Math.random().toString(36).substr(2, 3);
var projectName1 = "Dredd Project " + Math.random().toString(36).substring(7);
var projectKey2 = Math.random().toString(36).substr(2, 3);
var projectName2 = "Dredd Project Archive " + Math.random().toString(36).substring(7);

// hook to set the session cookie in all following requests
hooks.beforeEach(function (transaction) {
  transaction.request['headers']['apikey'] = apikey;
  if (!(transaction.name == 'Project > Create > Create' || transaction.name == 'Project > Create > CreateArchive' || transaction.name == 'User > Create > Create')) {
    transaction.request['headers']['project'] = projectId;
  } else {
    transaction.request['headers']['project'] = project;
  }
});

hooks.afterEach(function (transaction) {
  hooks.log(transaction.real.body);
  var obj = {
    'body': transaction.real.body,
    'uri': transaction.request.uri
  };
  responseStash.push(obj);
});

setTimeout(function() {
    console.log('Waiting after clearing file');
}, 3000);

writeFile("apikey=" + apikey + "\n");
writeFile("automationApiKey=" + automationApiKey + "\n");
//writeFile("automationApiKey=" + automationApiKey + "\n");
writeFile("demoFileForAttachment=" + demoFileForAttachment + "\n");



// Ids to be set before run (Will be deleted)

hooks.before("Admin > Get Info service > Get Info", function (transaction) {
});

hooks.after("Admin > Get Info service > Get Info", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  userOwnerId = bodyJson['customListObjs']['owner'][0]['id'];
  userOwnerAlias = bodyJson['customListObjs']['owner'][0]['name'];
  rqParentFolderId = bodyJson['rootFolders']['RQ']['id'];
  rqStateId = bodyJson['customListObjs']['requirementState'][0]['id'];
  rqPriorityId = bodyJson['customListObjs']['priority'][0]['id'];
  rqComponentId = bodyJson['customListObjs']['component'][0]['id'];
  rqViewId = bodyJson['latestViews']['RQ']['viewId'];
  rqFolderPathWithProjectName = "/" + bodyJson['currentProjectName']; // Changed it if you have changed name of folder

  issuePriorityId = bodyJson['customListObjs']['issuePriority'][0]['id'];
  issueTypeId = bodyJson['customListObjs']['issueType'][0]['id'];
  issueViewId = bodyJson['latestViews']['IS']['viewId'];

  testcaseParentFolderId = bodyJson['rootFolders']['TC']['id'];
  testcaseViewId = bodyJson['latestViews']['TC']['viewId'];
  testcasePriorityId = bodyJson['customListObjs']['priority'][0]['id'];
  testcaseComponentId = bodyJson['customListObjs']['component'][0]['id'];
  testcaseTypeId = bodyJson['customListObjs']['testCaseType'][0]['id'];
  testcaseTestingTypeId = bodyJson['customListObjs']['testingType'][0]['id'];
  testcaseStateId = bodyJson['customListObjs']['testCaseState'][0]['id'];

  testsuiteParentFolderId = bodyJson['rootFolders']['TS']['id'];
  testsuiteStateId = bodyJson['customListObjs']['testSuiteState'][0]['id'];
  testsuiteStateAlias = bodyJson['customListObjs']['testSuiteState'][0]['name'];
  testsuiteViewId = bodyJson['latestViews']['TS']['viewId'];

  executionTestcaseStepRunViewId = bodyJson['latestViews']['TCS']['viewId'];
  executionRunStatusId = bodyJson['allstatus'][0]['id'];
});

hooks.before("Project > Create > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['project']['name'] = projectName1;
  requestBody['project']['projectKey'] = projectKey1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Project > Create > Create", function (transaction) {

  var bodyJson = JSON.parse(transaction.real.body);
  projectId = bodyJson['data'][0]['projectID'];
  rqLinkReleaseId = bodyJson['data'][0]['releaseID'];
  rqLinkCycleId = bodyJson['data'][0]['cycleID'];
  writeFile("projectId=" + bodyJson['data'][0]['projectID'] + "\n");
  writeFile("rqFolderPathWithProjectName=" + bodyJson['data'][0]['project_Name'] + "\n");
  writeFile("rqLinkCycleId=" + rqLinkCycleId + "\n");
  writeFile("rqLinkReleaseId=" + rqLinkReleaseId + "\n");
  writeFile("rqLinkReleaseIdName=" + "Default Release" + "\n");
  writeFile("rqLinkCycleIdName=" + "Default Cycle" + "\n");
});

hooks.before("Project > Create > CreateArchive", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['project']['name'] = projectName2;
  requestBody['project']['projectKey'] = projectKey2;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Project > Create > CreateArchive", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  var projectIdForArchive = bodyJson['data'][0]['projectID'];
  writeFile("projectIdForArchive=" + projectIdForArchive + "\n");
});

hooks.before("Release > Create > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.release['projectID'] = projectId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Release > Create > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  releaseIdForArchive = bodyJson['data'][0]['releaseID'];
  writeFile("releaseIdForArchive=" + releaseIdForArchive + "\n");
});

hooks.before("Cycle > Create/Update > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.cycle['projectID'] = projectId;
  requestBody.cycle['releaseID'] = releaseIdForArchive;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Cycle > Create/Update > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("cycleIdForArchive=" + bodyJson['data'][0]['buildId'] + "\n");
});

hooks.before("Datagrid > Add Parameter > AddArchive", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['paramName'] = paramNameRandom1;
  requestBody['paramDes'] = paramDescriptionRandom1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Datagrid > Add Parameter > AddArchive", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("paramIdForArchive=" + bodyJson['data']['paramID'] + "\n");
});

hooks.before("Datagrid > Add Parameter > AddDatagrid", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['paramName'] = paramNameRandom2;
  requestBody['paramDes'] = paramDescriptionRandom2;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Datagrid > Add Parameter > AddDatagrid", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  paramIdForDatagrid = bodyJson['data']['paramID'];
  writeFile("paramIdForDatagrid=" + paramIdForDatagrid + "\n");
});

hooks.before("Datagrid > Add Parameter > AddDatagrid1", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['paramName'] = paramNameRandom3;
  requestBody['paramDes'] = paramDescriptionRandom3;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Datagrid > Add Parameter > AddDatagrid1", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  paramIdForDatagrid1 = bodyJson['data']['paramID'];
  writeFile("paramIdForDatagrid1=" + paramIdForDatagrid1 + "\n");
});


hooks.before("Datagrid > Create > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['name'] = datagridNameRandom;
  requestBody['parameters'][0]['paramID'] = paramIdForDatagrid;
  requestBody['parameters'][1]['paramID'] = paramIdForDatagrid1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > List > Get List", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['filter'][1]['value'] = [projectId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Datagrid > List > Get List", function (transaction) {
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var dataGridIdForArchive;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      dataGridIdForArchive = dataJson[i]['id']
      break;
    }
  }
  writeFile("dataGridIdForArchive=" + dataGridIdForArchive + "\n");
});

hooks.before("Requirement > Create/Update Folder > Create Folder", function (transaction) {
  transaction.request['headers']['scope'] = projectId;
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = rqParentFolderId;
  requestBody['name'] = requirementFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update Folder > Create Folder", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("rqFolderIdArchive=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Requirement > Create/Update > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderId'] = rqParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['priority'] = [rqPriorityId];
  requestBody['component'] = [rqComponentId];
  requestBody['requirementState'] = [rqStateId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  testcaseRequirementIdLink = bodyJson['data'][0]['id'];
  testcaseRequirementVersionIdLink = bodyJson['data'][0]['rqVersionId'];
  testcaseRequirementKeyLink = bodyJson['data'][0]['entityKey'];
  writeFile("testcaseRequirementKeyLink=" + testcaseRequirementKeyLink + "\n");
  writeFile("testcaseRequirementIdLink=" + testcaseRequirementIdLink + "\n");
  writeFile("testcaseRequirementVersionIdLink=" + testcaseRequirementVersionIdLink + "\n");
});

hooks.before("Requirement > Create/Update > CreateVersionDelete", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderId'] = rqParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['priority'] = [rqPriorityId];
  requestBody['component'] = [rqComponentId];
  requestBody['requirementState'] = [rqStateId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update > CreateVersionDelete", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  rqIdVersionDelete = bodyJson['data'][0]['rqVersionId'];
  rqIdforVersionDelete = bodyJson['data'][0]['id']
  writeFile("rqIdVersionDelete=" + rqIdVersionDelete + "\n");
  writeFile("rqIdforVersionDelete=" + rqIdforVersionDelete + "\n");
});

hooks.before("Requirement > Archive/Unarchive > Change Requirement state", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [rqIdVersionDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Create/Update > CreateArchiveDelete1", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderId'] = rqParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['priority'] = [rqPriorityId];
  requestBody['component'] = [rqComponentId];
  requestBody['requirementState'] = [rqStateId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update > CreateArchiveDelete1", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("rqId1ArchiveDelete=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Requirement > Create/Update > CreateArchiveDelete2", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderId'] = rqParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['priority'] = [rqPriorityId];
  requestBody['component'] = [rqComponentId];
  requestBody['requirementState'] = [rqStateId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update > CreateArchiveDelete2", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("rqId2ArchiveDelete=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Issue > Create/Update > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueType'] = issueTypeId;
  requestBody['issuePriority'] = issuePriorityId;
  requestBody['issueOwner'] = userOwnerId;
  requestBody['priority'] = [issuePriorityId];
  requestBody['type'] = [issueTypeId];
  requestBody['component'] = [rqComponentId];
  requestBody['owner'] = [userOwnerId];
  requestBody['release'] = [rqLinkReleaseId];
  requestBody['affectedRelease'] = rqLinkReleaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Issue > Create/Update > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  rqLinkIssueId = bodyJson['data'][0]['dfId'];
  writeFile("rqLinkIssueId=" + rqLinkIssueId + "\n");
});

hooks.before("Issue > Create/Update > CreateDelete", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueType'] = issueTypeId;
  requestBody['issuePriority'] = issuePriorityId;
  requestBody['issueOwner'] = userOwnerId;
  requestBody['priority'] = [issuePriorityId];
  requestBody['type'] = [issueTypeId];
  requestBody['component'] = [rqComponentId];
  requestBody['owner'] = [userOwnerId];
  requestBody['release'] = [rqLinkReleaseId];
  requestBody['affectedRelease'] = rqLinkReleaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Issue > Create/Update > CreateDelete", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("issueIdDelete=" + bodyJson['data'][0]['dfId'] + "\n");
});

hooks.before("Testcase > Create / Update Folder > Create", function (transaction) {
  transaction.request['headers']['scope'] = projectId;
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = testcaseParentFolderId;
  requestBody['name'] = testcaseFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testcase > Create / Update Folder > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testcaseFolderIdArchieve=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Testcase > Create/ Update > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = testcaseParentFolderId;
  requestBody['priority'] = testcasePriorityId;
  requestBody['owner'] = userOwnerId;
  requestBody['component'] = [testcaseComponentId];
  requestBody['testCaseState'] = testcaseStateId;
  requestBody['testCaseType'] = testcaseTypeId;
  requestBody['testingType'] = testcaseTestingTypeId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testcase > Create/ Update > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  rqLinkTestcaseId = bodyJson['data'][0]['id'];
  rqLinkTestcaseVersionId = bodyJson['data'][0]['tcVersionId'];
  writeFile("rqLinkTestcaseId=" + rqLinkTestcaseId + "\n");
  writeFile("rqLinkTestcaseVersionId=" + rqLinkTestcaseVersionId + "\n");
});

hooks.before("Testcase > Link TestCases > Link TestCases", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = testcaseRequirementKeyLink;
  requestBody['rqVersionId'] = testcaseRequirementVersionIdLink;
  requestBody['tcVersionIds'] = rqLinkTestcaseVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Create/ Update > CreateDelete", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = testcaseParentFolderId;
  requestBody['priority'] = testcasePriorityId;
  requestBody['owner'] = userOwnerId;
  requestBody['component'] = [testcaseComponentId];
  requestBody['testCaseState'] = testcaseStateId;
  requestBody['testCaseType'] = testcaseTypeId;
  requestBody['testingType'] = testcaseTestingTypeId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testcase > Create/ Update > CreateDelete", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testcaseIdDelete=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Testcase > Create/ Update > CreateDeleteVersion", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = testcaseParentFolderId;
  requestBody['priority'] = testcasePriorityId;
  requestBody['owner'] = userOwnerId;
  requestBody['component'] = [testcaseComponentId];
  requestBody['testCaseState'] = testcaseStateId;
  requestBody['testCaseType'] = testcaseTypeId;
  requestBody['testingType'] = testcaseTestingTypeId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testcase > Create/ Update > CreateDeleteVersion", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  testcaseIdDeleteForVersionDelete = bodyJson['data'][0]['id'];
  testcaseVersionIdDeleteForVersionDelete = bodyJson['data'][0]['tcVersionId'];
  writeFile("testcaseIdDeleteForVersionDelete=" + testcaseIdDeleteForVersionDelete + "\n");
});

hooks.before("Testcase > Archive/ Unarchive > Change state", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [testcaseVersionIdDeleteForVersionDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Platform > List > Get List", function (transaction) {
});

hooks.after("Platform > List > Get List", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  testsuiteLinkPlatformId = bodyJson['data'][0]['platformID'];
  writeFile("testsuiteLinkPlatformId=" + testsuiteLinkPlatformId + "\n");
});

hooks.before("Testsuite > Create Folder > Create", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = testsuiteParentFolderId;
  requestBody['name'] = testsuiteFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create Folder > Create", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testsuiteFolderIdArchieve=" + bodyJson['data'][0]['id'] + "\n");
});

hooks.before("Testsuite > Create/Update > CreateArchive", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create/Update > CreateArchive", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testsuiteIdForArchive=" + bodyJson['id'] + "\n");
});

hooks.before("Testsuite > Create/Update > CreateDelete", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create/Update > CreateDelete", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testsuiteIdDelete=" + bodyJson['id'] + "\n");
});

hooks.before("Testsuite > Create/Update > CreateDeleteBG", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create/Update > CreateDeleteBG", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("testsuiteIdDeleteBG=" + bodyJson['id'] + "\n");
});

hooks.before("Testsuite > Create/Update > CreateImport", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryImportRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create/Update > CreateImport", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  importTestsuiteId = bodyJson['id'];
  writeFile("importTestsuiteId=" + importTestsuiteId + "\n");
});

hooks.before("Testsuite > Add Scope > Add", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['data'][0]['tsId'] = importTestsuiteId;
  requestBody['data'][0]['buildID'] = rqLinkCycleId;
  requestBody['data'][0]['releaseId'] = rqLinkReleaseId;
  transaction.request.body = JSON.stringify(requestBody);
});


hooks.before("Testsuite > Create/Update > CreateOps", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryOpsRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testsuite > Create/Update > CreateOps", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  testcaseTestsuiteId = bodyJson['id'];
  testcaseTestsuiteKey = bodyJson['ENTITY_KEY'];
  writeFile("testcaseTestsuiteId=" + testcaseTestsuiteId + "\n");
  writeFile("testcaseTestsuiteKey=" + testcaseTestsuiteKey + "\n");
});

hooks.before("Testsuite > Link Platforms > Link", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmTsId'] = testcaseTestsuiteId;
  requestBody['qmPlatformId'] = testsuiteLinkPlatformId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Add Scope > AddOps", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['data'][0]['tsId'] = testcaseTestsuiteId;
  requestBody['data'][0]['buildID'] = rqLinkCycleId;
  requestBody['data'][0]['releaseId'] = rqLinkReleaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Link Testcase > LinkOps", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testcaseTestsuiteId;
  requestBody['tcvdIDs'] = [rqLinkTestcaseVersionId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Executions > Get List", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = testsuiteParentFolderId;
  requestBody['tsID'] = testcaseTestsuiteId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Execution > Fetch Executions > Get List", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  testsuiteRunId = bodyJson['data'][0]['tsRunID'];
  testsuiteDropId = bodyJson['data'][0]['cycleID'];
  writeFile("testsuiteRunId=" + testsuiteRunId + "\n");
  writeFile("testsuiteDropId=" + testsuiteDropId + "\n");
});

hooks.before("Execution > Fetch Testcase Run IDs > Get List", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsrID'] = testsuiteRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Execution > Fetch Testcase Run IDs > Get List", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  issueTestcaseRunId = bodyJson['data'][0]['tcRunID'];
  testcaseTcTsId = bodyJson['data'][0]['tctsID'];
  writeFile("issueTestcaseRunId=" + issueTestcaseRunId + "\n");
  writeFile("testcaseTcTsId=" + testcaseTcTsId + "\n");
});

hooks.before("Execution > Fetch Teststeprun > Get List", function (transaction) {
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcrID'] = issueTestcaseRunId;
  requestBody['viewId'] = executionTestcaseStepRunViewId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Execution > Fetch Teststeprun > Get List", function (transaction) {
  var bodyJson = JSON.parse(transaction.real.body);
  writeFile("issueTestcaseStepRunId=" + bodyJson['data'][0]['tcStepRunID'] + "\n");
});

// var testcaseTestsuiteId = properties.get('ref.testcaseTestsuiteId');  // [[TS 1]] Link above testcase (rqLinkTestcaseId), Link issue (rqLinkIssueId) to testcase
// var testcaseTestsuiteKey = properties.get('ref.testcaseTestsuiteKey');
// var testsuiteRunId = properties.get('ref.testsuiteRunId'); // [[TS 2]] get 'testsuite run id' from above testsuite's execution list (testcaseTestsuiteId) ///rest/execution/list/platformHome
// var testsuiteDropId = properties.get('ref.testsuiteDropId'); // [[TS 2]] get 'cycle id' from from above testsuite's execution list (testcaseTestsuiteId) ///rest/execution/list/platformHome
// var issueTestcaseRunId = properties.get('ref.issueTestcaseRunId'); //[[TS 3]]  get 'testcase Run Id' from (testsuiteRunId)
// var testcaseTcTsId = properties.get('ref.testcaseTcTsId'); //[[TS 4]] Get TctsId from above testsuite (issueTestcaseRunId)
// var issueTestcaseStepRunId = properties.get('ref.issueTestcaseStepRunId'); //[[TS 5]]

function clearFile() {
  fs.truncate('./development.properties', 0, function () { console.log('done') })
}
function writeFile(content) {
  fs.appendFile('./development.properties', content, function (err) {
    if (err) throw err;
    console.log('Updated!' + content);
  });
}


