const hooks = require('hooks');
const fs = require('fs');
const Multipart = require('multi-part'); //npm install multi-part --save
const async = require('async');
const await = require('await');
const streamToString = require('stream-to-string');
const PropertiesReader = require('properties-reader');  //npm install properties-reader --save
var properties = new PropertiesReader('./Prescript/development.properties');

var apikey = properties.get('apikey');
var automationApiKey = properties.get('automationApiKey');
var responseStash = [];

// Ids to be set before run (Will be deleted)
//var userForArchieveDelete = properties.get('userForArchieveDelete');
var rqId1ArchiveDelete = properties.get('rqId1ArchiveDelete');
var rqId2ArchiveDelete = properties.get('rqId2ArchiveDelete');
var rqIdforVersionDelete = properties.get('rqIdforVersionDelete');
var rqIdVersionDelete = properties.get('rqIdVersionDelete'); // Must be archieved first(1) version
var issueIdDelete = properties.get('issueIdDelete');
var testcaseIdDelete = properties.get('testcaseIdDelete');
var testcaseIdDeleteForVersionDelete = properties.get('testcaseIdDeleteForVersionDelete'); // Must be archieved first version
var testsuiteIdDelete = properties.get('testsuiteIdDelete');
var testsuiteIdDeleteBG = properties.get('testsuiteIdDeleteBG');

// Ids to be set before run
var projectId = properties.get('projectId');
var projectIdForArchive = properties.get('projectIdForArchive');
var releaseIdForArchive = properties.get('releaseIdForArchive'); // Set date range for this realease must be around 'create cycle date range (Cycle > Create/Update > Create)' in document
var cycleIdForArchive = properties.get('cycleIdForArchive');
var paramIdForArchive = properties.get('paramIdForArchive');
var paramIdForDatagrid = properties.get('paramIdForDatagrid');
var paramIdForDatagrid1 = properties.get('paramIdForDatagrid1');
var dataGridIdForArchive = properties.get('dataGridIdForArchive'); // Dont use paramIdForArchive id parameter to create thid datagrid.

var rqFolderIdArchive = properties.get('rqFolderIdArchive');
var rqLinkIssueId = properties.get('rqLinkIssueId');
var rqLinkTestcaseId = properties.get('rqLinkTestcaseId'); // It must have steps will be used in  (issueTestcaseStepRunId)
var rqLinkTestcaseVersionId = properties.get('rqLinkTestcaseVersionId');  //Above testcase version
var rqLinkReleaseId = properties.get('rqLinkReleaseId'); // No nedd to create use default
var rqLinkCycleId = properties.get('rqLinkCycleId'); // No nedd to create use default
var rqLinkReleaseIdName = properties.get('rqLinkReleaseIdName'); // rqLinkReleaseId above release name 
var rqLinkCycleIdName = properties.get('rqLinkCycleIdName'); // rqLinkCycleId above cycle name

var testcaseFolderIdArchieve = properties.get('testcaseFolderIdArchieve');
var testcaseRequirementIdLink = properties.get('testcaseRequirementIdLink');
var testcaseRequirementVersionIdLink = properties.get('testcaseRequirementVersionIdLink');

var testcaseTestsuiteId = properties.get('testcaseTestsuiteId');  // [[TS 1]] Link above testcase (rqLinkTestcaseId), Link issue (rqLinkIssueId) to testcase
var testcaseTestsuiteKey = properties.get('testcaseTestsuiteKey');
var testsuiteRunId = properties.get('testsuiteRunId'); // [[TS 2]] get 'testsuite run id' from above testsuite's execution list (testcaseTestsuiteId) ///rest/execution/list/platformHome
var testsuiteDropId = properties.get('testsuiteDropId'); // [[TS 2]] get 'cycle id' from from above testsuite's execution list (testcaseTestsuiteId) ///rest/execution/list/platformHome
var issueTestcaseRunId = properties.get('issueTestcaseRunId'); //[[TS 3]]  get 'testcase Run Id' from (testsuiteRunId)
var testcaseTcTsId = properties.get('testcaseTcTsId'); //[[TS 4]] Get TctsId from above testsuite (issueTestcaseRunId)
var issueTestcaseStepRunId = properties.get('issueTestcaseStepRunId'); //[[TS 5]]

var testsuiteIdForArchive = properties.get('testsuiteIdForArchive');
var testsuiteLinkPlatformId = properties.get('testsuiteLinkPlatformId');
var testsuiteFolderIdArchieve = properties.get('testsuiteFolderIdArchieve');

var importTestsuiteId = properties.get('importTestsuiteId'); // Create test suite with above rqLinkReleaseId and rqLinkCycleId

var demoFileForAttachment = properties.get('demoFileForAttachment');


//Auto Assign ids after api call
var rqCreatedId = 3334832;
var rqCreatedEntityKey;
var rqCreatedVersionId;
var rqUpdateVersionId;

var issueCreatedId;
var issueCreatedEntityKey;

var testcaseCreatedId;
var testcaseCreatedEntityKey;
var testcaseCreatedVersionId;
var testcaseUpdateVersionId;

var testsuiteCreatedId;
var testsuiteCreatedEntityKey;

//Fetched from get Info
var rqParentFolderId;
var userOwnerId;
var userOwnerAlias;
var rqStateId;
var rqPriorityId;
var rqComponentId;
var rqViewId;
var rqFolderPathWithProjectName; // Changed it if you have changed name of folder

var issuePriorityId;
var issueTypeId;
var issueViewId;

var testcaseParentFolderId;
var testcaseViewId;
var testcasePriorityId;
var testcaseComponentId;
var testcaseTypeId;
var testcaseTestingTypeId;
var testcaseStateId;

var testsuiteParentFolderId;
var testsuiteStateId;
var testsuiteStateAlias;
var testsuiteViewId;

var executionTestcaseStepRunViewId;
var executionRunStatusId;

// Random values - Not required to update.
var buildNameRandom = 'Build Name ' + Math.random().toString(36).substring(7);
var buildDescriptionRandom = 'Description for Build is ' + Math.random().toString(36).substring(7);
var platformName = "Platform " + Math.random().toString(36).substring(7);
var platformNameUpdated = "Platform Edited " + Math.random().toString(36).substring(7);
var paramNameRandom = "Param Name " + Math.random().toString(36).substring(7);
var paramNameUpdateRandom = "Param Name Edited " + Math.random().toString(36).substring(7);
var paramDescriptionRandom = "Param Description " + Math.random().toString(36).substring(7);
var datagridNameRandom = "Datagrid Name " + Math.random().toString(36).substring(7);
var datagridNameUpdateRandom = "Datagrid Name " + Math.random().toString(36).substring(7);
var requirementFolderNameRandom = "Req Folder " + Math.random().toString(36).substring(7);
var requirementFolderNameUpdateRandom = "Req Folder Edited " + Math.random().toString(36).substring(7);
var testcaseFolderNameRandom = "Testcase Folder " + Math.random().toString(36).substring(7);
var testcaseFolderNameUpdateRandom = "Testcase Folder Edited " + Math.random().toString(36).substring(7);
var testsuiteFolderNameRandom = "Testsuited Folder " + Math.random().toString(36).substring(7);
var testsuiteFolderNameUpdateRandom = "Testsuite Folder Edited " + Math.random().toString(36).substring(7);
var testsuiteSummaryRandom = "Testsuite Summary " + Math.random().toString(36).substring(7);
var testsuiteSummaryUpdateRandom = "Testsuite Summary Edited " + Math.random().toString(36).substring(7);
var projectKey = Math.random().toString(36).substr(2, 3);
var projectName = "Project Name " + Math.random().toString(36).substring(7);
var cycleNameRandom = "Cycle Name " + Math.random().toString(36).substring(7);
var releaseNameRandom = "Release Name " + Math.random().toString(36).substring(7);

var projectKeyCreate = Math.random().toString(36).substr(2, 3);
var projectNameCreate = "Project Name " + Math.random().toString(36).substring(7);

 
// hook to set the session cookie in all following requests
hooks.beforeEach(function (transaction) {  
  transaction.request['headers']['apikey'] = apikey;
  transaction.request['headers']['project'] = projectId;  											  
});

hooks.afterEach(function (transaction) {  
  //hooks.log(transaction.request.uri + " : " + transaction.real.body);
  var obj = {
    'body': transaction.real.body,
    'uri': transaction.request.uri
  };
  responseStash.push(obj);
});

// ********************************************************
// ************************ Admin *************************
// ********************************************************

hooks.before("Admin > Get Info service > Get Info", function (transaction) {
  hooks.log("before Admin > Get Info service > Get Info");
});

hooks.after("Admin > Get Info service > Get Info", function (transaction) {
  hooks.log("after Admin > Get Info service > Get Info");
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

hooks.before("Admin > Fetch Audit Logs > Get List", function (transaction) {
  hooks.log("before Admin > Fetch Audit Logs > Get List");
});

hooks.before("Admin > Generate Automation API Key > Generate Automation API Key", function(transaction) {
  hooks.log("before Admin > Generate Automation API Key > Generate Automation API Key");
});

hooks.before("Admin > Get Agents > Get List", function (transaction) {
  hooks.log("before Admin / Get Agents / Get List");
  transaction.request['headers']['apikey'] = automationApiKey;
});

hooks.before("Admin > Fetch Execution statuses > Get List", function (transaction) {
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project/getinfo');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['roleID'];

  hooks.log("before Admin > Fetch Execution statuses > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['roleID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});
hooks.before("Admin > Fetch integrations > Get List", function (transaction) {
  hooks.log("before Admin > Fetch integrations > Get List");
});
hooks.before("Admin > Fetch fields > Get List", function (transaction) {
  hooks.log("before Admin > Fetch fields > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = projectId;
  transaction.request.body = JSON.stringify(requestBody);
});
hooks.before("Admin > Fetch roles > Get List", function (transaction) {
  hooks.log("before Admin > Fetch roles > Get List");
});
hooks.before("Admin > Fetch available Releases and Cycles > Get List", function (transaction) {
  hooks.log("before Admin > Fetch available Releases and Cycles > Get List");
});

// ********************************************************
// ********************* Custom List **********************
// ********************************************************

hooks.before("Custom list > Fetch list items > Get List", function (transaction) {
  hooks.log("before Custom list / Fetch list items / Get List");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/customlist/add');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmMasterId'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});
hooks.before("Custom list > Archive list items > Archive", function (transaction) {
  hooks.log("before Custom list / Archive list items / Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/customlist/listval');
  //console.log("DEBUGGGG:result:",result);
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data'];
  var id = [];
  for (i = 0; i < dataJson.length; i++) {
    //console.log("DEBUGGGG:dataRaw:",dataJson[i]);
    if (dataJson[i].Name == 'Email') {
      //console.log("DEBUGGGG:dataRaw.Name:",dataJson[i].Name);
      id.push(dataJson[i].Id);
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['listDetailIDs'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});
hooks.before("Custom list > Update list > Update", function (transaction) {
  hooks.log("before Custom list / Update list / Update");
  //Get listId
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/customlist/add');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var listId = bodyJson['data'][0]['id'];

  //Get list valueId 
  var listValResult = responseStash.filter(element => element['uri'] == '/rest/admin/customlist/listval');
  var listValBodyString = listValResult[0]['body'];
  var dataJson = JSON.parse(listValBodyString)['data'];
  var listValId;
  var listValIdUpdate;
  //console.log("DEBUGGGG:dataJson:",dataJson);
  for (i = 0; i < dataJson.length; i++) {
    //console.log("DEBUGGGG:dataRaw:",dataJson[i]);
    if (dataJson[i].Name == 'Email') {      
      listValId = dataJson[i].Id;   
    }
	if (dataJson[i].Name == 'Name') {      
      listValIdUpdate = dataJson[i].Id;   
    }
	
  }
  //console.log("DEBUGGGG:listValId:"+listValId);
  //Update values in request body
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['listId'] = listId;
  requestBody['listValueDeleted'][0]['Id'] = listValId;
  requestBody['listValueDeleted'][0]['isArchived'] = true;  
  requestBody['listValue'][1]['Id'] = listValIdUpdate;
  
  transaction.request.body = JSON.stringify(requestBody);  
});
hooks.before("Custom list > Delete list > Delete", function (transaction) {
  hooks.log("before Custom list / Delete list / Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/customlist/add');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['listId'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// *********************** Project ************************
// ********************************************************

//Delete cloned project manually after calling clone project API

hooks.before("Project > Create > Create", function (transaction) {
  hooks.log("before Project > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['project']['name'] = projectNameCreate;
  requestBody['project']['projectKey'] = projectKeyCreate;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Project > List > Get List", function (transaction) {
  hooks.log("before Project > List > Get List");
});

hooks.before("Project > Archive > Archive", function (transaction) {
  hooks.log("before Project > Archive > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['projectID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = [id, projectIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Project > Unarchive > Unarchive", function (transaction) {
  hooks.log("before Project > Unarchive > Unarchive");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = [projectIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Project > Clone > Clone", function (transaction) {
  hooks.log("before Project > Clone > Clone");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['projectID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = id;
  requestBody['Projectkey'] = projectKey;
  requestBody['newProject'] = projectName;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Project > Delete > Delete", function (transaction) {
  hooks.log("before Project > Delete > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['projectID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// *********************** Realease ***********************
// ********************************************************

hooks.before("Release > Create > Create", function (transaction) {
  hooks.log("before Release > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.release['projectID'] = projectId;
  requestBody.release['name'] = releaseNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Release > List > Get List", function (transaction) {
  hooks.log("before Release > List > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.params['projectID'] = projectId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Release > Archive > Archive", function (transaction) {
  hooks.log("before Release > Archive > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/release');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['releaseID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = projectId;
  requestBody['releaseID'] = [id, releaseIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Release > Unarchive > Unarchive", function (transaction) {
  hooks.before("before Release > Unarchive > Unarchive");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectID'] = projectId;
  requestBody['releaseID'] = [releaseIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Release > Delete > Delete", function (transaction) {
  hooks.before("before Release > Delete > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/release');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['releaseID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['releaseID'] = [id];
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ************************ Cycle *************************
// ********************************************************

hooks.before("Cycle > Create/Update > Create", function (transaction) {
  hooks.log("before Cycle > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.cycle['projectID'] = projectId;
  requestBody.cycle['releaseID'] = releaseIdForArchive;
  requestBody.cycle['name'] = cycleNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Cycle > Create/Update > Update", function (transaction) {
  hooks.log("before Cycle > Create/Update > Update");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/cycle');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['buildId'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['cycle']['buildID'] = id;
  requestBody['cycle']['releaseID'] = releaseIdForArchive;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Cycle > List > Get List", function (transaction) {
  hooks.log("before Cycle > List > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody.params['releaseID'] = releaseIdForArchive;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Cycle > Archive > Archive", function (transaction) {
  hooks.log("before Cycle > Archive > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/cycle');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['buildId'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['releaseID'] = releaseIdForArchive;
  requestBody['buildID'] = [id, cycleIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Cycle > Unarchive > Unarchive", function (transaction) {
  hooks.log("before Cycle > Unarchive > Unarchive");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['releaseID'] = releaseIdForArchive;
  requestBody['buildID'] = [cycleIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Cycle > Delete > Delete", function (transaction) {
  hooks.log("before Cycle > Delete > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/cycle');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['buildId'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['buildID'] = [id];
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ************************ Build *************************
// ********************************************************

hooks.before("Build > Create > Create", function (transaction) {
  hooks.log("before Build > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['name'] = buildNameRandom;
  requestBody['Description'] = buildDescriptionRandom;
  requestBody['grdRelCyc'][0]['relID'] = rqLinkReleaseId;
  requestBody['grdRelCyc'][0]['cyclID'] = rqLinkCycleId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Build > List > Get List", function (transaction) {
  hooks.log("before Build > List > Get List");
});

hooks.before("Build > Archive > Archive", function (transaction) {
  hooks.log("before Build > Archive > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/drops');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['dropID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['dropIds'] = [id];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Build > Unarchive > Unarchive", function (transaction) {
  hooks.log("before Build > Unarchive > Unarchive");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/drops');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['dropID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['dropIds'] = [id];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Build > Get details > Get details", function (transaction) {
  hooks.log("before Build > Get details > Get details");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/drops');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['dropID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

// ********************************************************
// ********************** Platform ************************
// ********************************************************

hooks.before("Platform > Create/Update > Create", function (transaction) {
  hooks.log('before Platform > Create/Update > Create');
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['name'] = platformName;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Platform > Update > Update", function (transaction) {
  hooks.log('before Platform > Update > Update');
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/platform');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['platformID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['platformID'] = id;
  requestBody['name'] = platformNameUpdated;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Platform > List > Get List", function (transaction) {
  hooks.log('before Platform > List > Get List');
});


// ********************************************************
// ************************ Users *************************
// ********************************************************

hooks.before("Users > Create > Create", function (transaction) {
  hooks.log("before Users > Create > Create");
  var userAlias = "Alias" + Math.random().toString(36).substring(7);
  var loginId = "User" + Math.random().toString(36).substring(7);;
  var email = "User" + Math.random().toString(36).substring(7) + "@gmail.com";
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project/getinfo');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var roleId = bodyJson['roleID'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['user']['loginId'] = loginId;
  requestBody['user']['userAlias'] = userAlias;
  requestBody['user']['email'] = email;
  requestBody['maprole']['userRoles'][0]['projectID'] = projectId;
  requestBody['maprole']['userRoles'][0]['roleID'] = roleId;
  transaction.request.body = JSON.stringify(requestBody);
});


hooks.before("Users > List > Get List", function (transaction) {
  hooks.log("before Users > List > Get List");
});

hooks.before("Users > Update > Update", function (transaction) {
  hooks.log("before Users > Update > Update");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/user/withrole');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['userID'];

  var result = responseStash.filter(element => element['uri'] == '/rest/admin/project/getinfo');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var roleId = bodyJson['roleID'];

  var userAlias = "Alias" + Math.random().toString(36).substring(7) + "1";
  var loginId = "User" + Math.random().toString(36).substring(7) + "1";
  var email = "User" + Math.random().toString(36).substring(7) + "1" + "@gmail.com";
  
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['user']['userID'] = id;
  requestBody['maprole']['userRoles'][0]['projectID'] = projectId;
  requestBody['maprole']['userRoles'][0]['roleID'] = roleId;
  requestBody['user']['userAlias'] = userAlias;
  requestBody['user']['email'] = email;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Users > Activate > Change state", function (transaction) {
  hooks.log("before Users > Activate > Change state");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/user/withrole');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['userID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['userID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Users > Deactivate > Change state", function (transaction) {
  hooks.log("before Users > Deactivate > Change state");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/user/withrole');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['userID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['userID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Users > Delete > Delete", function (transaction) {
  hooks.log("before Users > Delete > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/admin/user/withrole');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['userID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['userID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ********************* Requirement **********************
// ********************************************************

hooks.before("Requirement > Create/Update Folder > Create Folder", function (transaction) {
  hooks.log("before Requirement > Create/Update Folder > Create Folder");
  transaction.request['headers']['scope'] = projectId;
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = rqParentFolderId;
  requestBody['name'] = requirementFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Update > Update Folder", function (transaction) {
  hooks.log("before Requirement > Update > Update Folder");
  var result = responseStash.filter(element => element['uri'] == '/rest/requirements/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderId'] = id;
  requestBody['name'] = requirementFolderNameUpdateRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Folder Archieve > Folder Archieve", function (transaction) {
  hooks.log("before Requirement > Folder Archieve > Folder Archieve");
  var result = responseStash.filter(element => element['uri'] == '/rest/requirements/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderIDs'] = [id, rqFolderIdArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Folder Unarchieve > Folder Unarchieve", function (transaction) {
  hooks.log("before Requirement > Folder Unarchieve > Folder Unarchieve");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderIDs'] = [rqFolderIdArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > List of folders > Get List", function (transaction) {
  hooks.log("before Requirement > List of folders > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderID'] = rqParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Delete Folder > Delete", function (transaction) {
  hooks.log("before Requirement > Delete Folder > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/requirements/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderId'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Create/Update > Create", function (transaction) {
  hooks.log("before Requirement > Create/Update > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqFolderId'] = rqParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['priority'] = [rqPriorityId];
  requestBody['component'] = [rqComponentId];
  requestBody['requirementState'] = [rqStateId];  
  requestBody['releaseCycleMapping'][0]['release'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['cycle'] = [rqLinkCycleId];  
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Create/Update > Create", function (transaction) {
  hooks.log("after Requirement > Create/Update > Create");
  var bodyJson = JSON.parse(transaction.real.body);
  rqCreatedId = bodyJson['data'][0]['id'];
  rqCreatedEntityKey = bodyJson['data'][0]['entityKey'];
  rqCreatedVersionId = bodyJson['data'][0]['rqVersionId'];
});

hooks.before("Requirement > Update Requirement > Update", function (transaction) {
  hooks.log("before Requirement > Update Requirement > Update");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqId'] = rqCreatedId;
  requestBody['rqVersionId'] = rqCreatedVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Requirement > Update Requirement > Update", function (transaction) {
  hooks.log("after Requirement > Update > Update");
  var bodyJson = JSON.parse(transaction.real.body);
  rqUpdateVersionId = bodyJson['data'][0]['rqVersionID'];
});

hooks.before("Requirement > Fetch Requirement > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Requirement > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  requestBody['viewId'] = rqViewId;
  requestBody['filter'] = "[]";
  requestBody['udfFilter'] = "[]";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Requirements > Get Requirement Details", function (transaction) {
  hooks.log("before Requirement > Fetch Requirements > Get Requirement Details");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > List versions > Get detail", function (transaction) {
  hooks.log("before Requirement > List versions > Get detail");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > List Detail > Get detail", function (transaction) {
  hooks.log("before Requirement > List Detail > Get detail");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Archive/Unarchive > Change Requirement state", function (transaction) {
  hooks.log("before Requirement > Archive/Unarchive > Change Requirement state");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [rqId1ArchiveDelete, rqId2ArchiveDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Delete - Background Process > Delete", function (transaction) {
  hooks.log("before Requirement > Delete - Background Process > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqId'] = rqId1ArchiveDelete;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Delete single or multiple > Delete", function (transaction) {
  hooks.log("before Requirement > Delete single or multiple > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [rqId2ArchiveDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Delete Version > Delete", function (transaction) {
  hooks.log("before Requirement > Delete Version > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqIdforVersionDelete;
  requestBody['entityVersions'] = [1];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Link issues > Link", function (transaction) {
  hooks.log("before Requirement > Link issues > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedEntityKey;
  requestBody['dfIDs'] = rqLinkIssueId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Requirements linked to Issue > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Requirements linked to Issue > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['dfID'] = rqLinkIssueId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Unlink Issue > Unlink", function (transaction) {
  hooks.log("before Requirement > Unlink Issue > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedEntityKey;
  requestBody['dfIDs'] = [rqLinkIssueId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Issue Linked to Requirement > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Issue Linked to Requirement > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Link TestCases > Link TestCases", function (transaction) {
  hooks.log("before Requirement > Link TestCases > Link TestCases");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedEntityKey;
  requestBody['rqVersionId'] = rqUpdateVersionId;
  requestBody['tcVersionIds'] = [rqLinkTestcaseVersionId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Requirements linked to Testcase > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Requirements linked to Testcase > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = rqLinkTestcaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Unlink Testcase > Unlink Testcase", function (transaction) {
  hooks.log("before Requirement > Unlink Testcase > Unlink Testcase");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedEntityKey;
  requestBody['rqVersionId'] = rqUpdateVersionId;
  requestBody['tcVersionIds'] = rqLinkTestcaseVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Requirements linked to TestSuite > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Requirements linked to TestSuite > Get List");
});

hooks.before("Requirement > Get list of users of project > Get List", function (transaction) {
  hooks.log("before Requirement > Get list of users of project > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectId'] = projectId;
  requestBody['rqId'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Requirements for Bulk Opeartion. > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Requirements for Bulk Opeartion. > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  requestBody['filter'] = "[]";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Testcases > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Testcases > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > View Version Info > View", function (transaction) {
  hooks.log("before Requirement > View Version Info > View");
  transaction.request.uri = transaction.request.uri.replace('139276', rqCreatedId);
  transaction.fullPath = transaction.fullPath.replace('139276', rqCreatedId);

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Add Scope > Add", function (transaction) {
  hooks.log("before Requirement > Add Scope > Add");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqCreatedId;
  requestBody['sourceBuildId'] = rqLinkCycleId;
  requestBody['sourceProjectId'] = projectId;
  requestBody['sourceReleaseId'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['release'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['cycle'] = [rqLinkCycleId];
  requestBody['releaseCycleMapping'][0]['version'] = 1;
  requestBody['destinationProjectId'] = projectId;
  requestBody['entityData'][0]['entityId'] = rqCreatedId;
  requestBody['entityData'][0]['version'] = rqUpdateVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Fetch Scope > Get List", function (transaction) {
  hooks.log("before Requirement > Fetch Scope > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityID'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Requirement > Remove Scope > Remove", function (transaction) {
  hooks.log("before Requirement > Remove Scope > Remove");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['sourceProjectId'] = projectId;
  requestBody['sourceReleaseId'] = rqLinkReleaseId;
  requestBody['sourceBuildId'] = rqLinkCycleId;
  requestBody['entityId'] = rqCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ************************ Issue *************************
// ********************************************************

hooks.before("Issue > Create/Update > Create", function (transaction) {
  hooks.log("before Issue > Create/Update > Create");
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
  hooks.log("after Issue > Create/Update > Create");
  var bodyJson = JSON.parse(transaction.real.body);
  issueCreatedId = bodyJson['data'][0]['dfId'];
  issueCreatedEntityKey = bodyJson['data'][0]['id'];
});

hooks.before("Issue > Create/Update > Update", function (transaction) {
  hooks.log("before Issue > Create/Update > Update");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['DefectId'] = issueCreatedId;
  requestBody['entityKey'] = issueCreatedEntityKey;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Fetch issues > Get List", function (transaction) {
  hooks.log("before Issue > Fetch issues > Get List");
});

hooks.before("Issue > Fetch Issue > Get List", function (transaction) {
  hooks.before("before Issue > Fetch Issue > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['viewId'] = issueViewId;
  requestBody['filter'] = "[]";
  requestBody['udfFilter'] = "[]";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Delete > Delete", function (transaction) {
  hooks.log("before Issue > Delete > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [issueIdDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Fetch linked issues to TC Run. > Get List", function (transaction) {
  hooks.log("before Issue > Fetch linked issues to TC Run. > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Fetch unlinked issues to link with TC Step Run > Get List", function (transaction) {
  hooks.log("before Issue > Fetch unlinked issues to link with TC Step Run > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseStepRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Fetch issues to link with execution > Get List", function (transaction) {
  hooks.log("before Issue > Fetch issues to link with execution > Get List");
});

hooks.before("Issue > Link requirements > Link", function (transaction) {
  hooks.log("before Issue > Link requirements > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['isID'] = issueCreatedEntityKey;
  requestBody['rqIDs'] = [rqCreatedId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Unlink Requirements > Unlink", function (transaction) {
  hooks.log("before Issue > Unlink Requirements > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['isID'] = issueCreatedEntityKey;
  requestBody['rqIDs'] = [rqCreatedId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Issue > Fetch Executions For Issue > Get List", function (transaction) {
  hooks.log("before Issue > Fetch Executions For Issue > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['linkedAsset']['id'] = rqLinkIssueId;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ********************** Attachment **********************
// ********************************************************

hooks.before("Attachment > Upload File > Upload", async function (transaction, done) {
  hooks.log("before Attachment > Upload File > Upload");
  const form = new Multipart();
   hooks.log("before Attachment > Upload File > Upload 1");
  form.append('file', fs.createReadStream(demoFileForAttachment));
  hooks.log("before Attachment > Upload File > Upload 2");
  transaction.request.body = await streamToString(form.getStream());
  hooks.log("before Attachment > Upload File > Upload 3");
  transaction.request.headers['Content-Type'] = form.getHeaders()['content-type'];
  hooks.log("before Attachment > Upload File > Upload 4");
  done();
  hooks.log("before Attachment > Upload File > Upload 5");
});

hooks.after("Attachment > Upload File > Upload", function (transaction) {
  hooks.log("after Attachment > Upload File > Upload");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
});

hooks.before("Attachment > Link Attachment > Link", function (transaction) {
  hooks.log("before Attachment > Link Attachment > Link");
  var result = responseStash.filter(element => element['uri'] == '/rest/attachments');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqCreatedId;
  requestBody['attachmentIds'] = id;
  requestBody['entityType'] = "RQ";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Attachment > Link Attachment > Link", function (transaction) {
  hooks.log("after Attachment > Link Attachment > Link");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
});

hooks.before("Attachment > Fetch linked attachments > Get List", function (transaction) {
  hooks.log("before Attachment > Fetch linked attachments > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqCreatedId;
  requestBody['entityType'] = "RQ";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Attachment > Fetch linked attachments > Get List", function (transaction) {
  hooks.log("before Attachment > Fetch linked attachments > Get List");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
});

hooks.before("Attachment > Attach logs to TC Run > Upload", async function (transaction, done) {
  hooks.log("before Attachment > Attach logs to TC Run > Upload");
  const form = new Multipart();
  form.append('entityId', issueTestcaseRunId);
  form.append('type', "TCR");
  form.append('file[]', fs.createReadStream(demoFileForAttachment));
  transaction.request.body = await streamToString(form.getStream());
  transaction.request.headers['Content-Type'] = form.getHeaders()['content-type'];
  done();
});

hooks.after("Attachment > Attach logs to TC Run > Upload", async function (transaction, done) {
  hooks.log("after Attachment > Attach logs to TC Run > Upload");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
  done();
});

hooks.before("Attachment > Download > Download", function (transaction) {
  hooks.log("before Attachment > Download > Download");
  var result = responseStash.filter(element => element['uri'] == '/rest/attachments');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  transaction.request.uri = transaction.request.uri.replace('297122', id);
  transaction.fullPath = transaction.fullPath.replace('297122', id);
});

hooks.after("Attachment > Download > Download", function (transaction) {
  hooks.log("after Attachment > Download > Download");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
});

hooks.before("Attachment > Unlink Attachment > Unlink", function (transaction) {
  hooks.log("before Attachment > Unlink Attachment > Unlink");
  var result = responseStash.filter(element => element['uri'] == '/rest/attachments');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = rqCreatedId;
  requestBody['attachmentIds'] = id;
  requestBody['entityType'] = "RQ";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Attachment > Unlink Attachment > Unlink", function (transaction) {
  hooks.log("after Attachment > Unlink Attachment > Unlink");
  hooks.log(transaction.request.uri + " : " + transaction.real.body);
});

// ********************************************************
// ************************ Import ************************
// ********************************************************

var demoEntityType = "JUNIT";
hooks.before("Import > Import Results > Import Result file", async function (transaction, done) {
  hooks.log("before Import > Import Results > Import Result file");

  var result = responseStash.filter(element => element['uri'] == '/rest/admin/drops');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var dropId = bodyJson['data'][0]['dropID'];

  const form = new Multipart();
  form.append('file', fs.createReadStream(demoFileForAttachment));
  form.append('entityType', demoEntityType);
  form.append('cycleID', rqLinkCycleId);
  form.append('platformID', testsuiteLinkPlatformId);
  form.append('testsuiteId', importTestsuiteId);
  form.append('projectID', projectId);
  form.append('releaseID', rqLinkReleaseId);
  form.append('buildID', dropId);
  transaction.request.body = await streamToString(form.getStream());
  transaction.request.headers['Content-Type'] = form.getHeaders()['content-type'];
  done();
});


// ********************************************************
// *********************** Testcase ***********************
// ********************************************************

hooks.before("Testcase > Create / Update Folder > Create", function (transaction) {
  hooks.log("before Testcase > Create / Update Folder > Create");
  transaction.request['headers']['scope'] = projectId;
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = testcaseParentFolderId;
  requestBody['name'] = testcaseFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Create / Update Folder > Update", function (transaction) {
  hooks.log("before Testcase > Update Folder > Update");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = id;
  requestBody['name'] = testcaseFolderNameUpdateRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > List of folders > Get List", function (transaction) {
  hooks.log("before Testcase > List of folders > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = testcaseParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Get Folder Metadata > Get Detail", function (transaction) {
  hooks.log("before Testcase > Get Folder Metadata > Get Detail");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderId'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Folder Archieve > Folder Archieve", function (transaction) {
  hooks.log("before Testcase > Folder Archieve > Folder Archieve");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderIDs'] = [id, testcaseFolderIdArchieve]
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Folder Unarchieve > Folder Unarchieve", function (transaction) {
  hooks.log("before Testcase > Folder Unarchieve > Folder Unarchieve");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderIDs'] = [testcaseFolderIdArchieve];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Delete folder > Delete", function (transaction) {
  hooks.log("before Testcase > Delete folder > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderId'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Create/ Update > Create", function (transaction) {
  hooks.log("before Testcase > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcFolderID'] = testcaseParentFolderId;
  requestBody['priority'] = testcasePriorityId;
  requestBody['owner'] = userOwnerId;
  requestBody['component'] = [testcaseComponentId];
  requestBody['testCaseState'] = testcaseStateId;
  requestBody['testCaseType'] = testcaseTypeId;
  requestBody['testingType'] = testcaseTestingTypeId;
  requestBody['releaseCycleMapping'][0]['release'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['cycle'] = [rqLinkCycleId];
  requestBody['releaseCycleMapping'][0]['version'] = 1;
  transaction.request.body = JSON.stringify(requestBody);
  hooks.log(transaction.request.body);
});

hooks.after("Testcase > Create/ Update > Create", function (transaction) {
  hooks.log("after Testcase > Create/ Update > Create");
  var bodyJson = JSON.parse(transaction.real.body);
  testcaseCreatedId = bodyJson['data'][0]['id'];
  testcaseCreatedEntityKey = bodyJson['data'][0]['entityKey'];
  testcaseCreatedVersionId = bodyJson['data'][0]['tcVersionId'];
});

hooks.before("Testcase > Create/ Update > Update", function (transaction) {
  hooks.log("before Testcase > Create/ Update > Update");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedId;
  requestBody['tcVersionID'] = testcaseCreatedVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.after("Testcase > Create/ Update > Create", function (transaction) {
  hooks.log("after Testcase > Create/ Update > Create");
  var bodyJson = JSON.parse(transaction.real.body);
  testcaseUpdateVersionId = bodyJson['data'][0]['tcVersionId'];
});

hooks.before("Testcase > Archive/ Unarchive > Change state", function (transaction) {
  hooks.log("before Testcase > Archive/ Unarchive > Change state");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [testcaseIdDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Add Comments > Add", function (transaction) {
  hooks.log("before Testcase > Add Comments > Add");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Comments > Get", function (transaction) {
  hooks.log("before Testcase > Fetch Comments > Get");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Edit Comments > Edit", function (transaction) {
  hooks.log("before Testcase > Edit Comments > Edit");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/comments');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var commentId = bodyJson['data'][0]['commentID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  requestBody['commentId'] = commentId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Delete Comments > Delete", function (transaction) {
  hooks.log("before Testcase > Delete Comments > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/testcases/comments');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var commentId = bodyJson['data'][0]['commentID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['commentId'] = commentId;
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

// hooks.before("Testcase > Delete - Background Process > Delete", function(transaction){
// 	hooks.log("before Testcase > Delete - Background Process > Delete");
// 	var requestBody = JSON.parse(transaction.request.body);
// 	requestBody['id'] = testcaseIdDeleteBG;
// 	transaction.request.body = JSON.stringify(requestBody);
// });

hooks.before("Testcase > Delete > Delete", function (transaction) {
  hooks.log("before Testcase > Delete > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [testcaseIdDelete];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Versions > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Versions > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Delete Version > Delete", function (transaction) {
  hooks.log("before Testcase > Delete Version > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseIdDeleteForVersionDelete;
  requestBody['entityVersions'] = 1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Executions For Testcase > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Executions For Testcase > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcid'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Testsuite to Link With Testcase > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Testsuite to Link With Testcase > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = testsuiteParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Issues > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Issues > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['linkedAsset']['id'] = rqLinkTestcaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

//Pending complete once you get updated api

// hooks.before("Testcase > Get parameter info of Testcase linked to Testsuite > Get parameter detail", function(transaction){
// 	hooks.log("before Testcase > Get parameter info of Testcase linked to Testsuite > Get parameter detail");
// 	var requestBody = JSON.parse(transaction.request.body);
// 	requestBody['tctsID'] = demoTctsId;
// 	transaction.request.body = JSON.stringify(requestBody);
// });

hooks.before("Testcase > Fetch Versions Detail > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Versions Detail > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Link Requirements > Link", function (transaction) {
  hooks.log("before Testcase > Link Requirements > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedEntityKey;
  requestBody['tcVersionId'] = testcaseUpdateVersionId;
  requestBody['rqVersionIds'] = testcaseRequirementVersionIdLink;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Testcase Linked to Requirement > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Testcase Linked to Requirement > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['rqID'] = testcaseRequirementIdLink;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch linked Requirements to Testcase > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch linked Requirements to Testcase > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Unlink Requirements > Unlink", function (transaction) {
  hooks.log("before Testcase > Unlink Requirements > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedEntityKey;
  requestBody['tcVersionId'] = testcaseUpdateVersionId;
  requestBody['rqVersionIds'] = testcaseRequirementVersionIdLink;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Link TestSuites > Link", function (transaction) {
  hooks.log("before Testcase > Link TestSuites > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcID'] = testcaseCreatedEntityKey;
  requestBody['tsIDs'] = testcaseTestsuiteKey;
  requestBody['tcVersion'] = 1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Details > Get Details", function (transaction) {
  hooks.log("before Testcase > Fetch Details > Get Details");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = testcaseCreatedId;
  requestBody['version'] = 1;
  requestBody['tcFolderID'] = testcaseParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Testcase > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Testcase > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['viewId'] = testcaseViewId;
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  requestBody['filter'] = "[]";
  requestBody['udfFilter'] = "[]";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Testcase Linked to Testsuite > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Testcase Linked to Testsuite > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testcaseTestsuiteId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch List for Bulk Opeartion > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch List for Bulk Opeartion > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Add Scope > Add", function (transaction) {
  hooks.log("before Testcase > Add Scope > Add");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  requestBody['sourceBuildId'] = rqLinkCycleId;
  requestBody['sourceProjectId'] = projectId;
  requestBody['sourceReleaseId'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['release'] = rqLinkReleaseId;
  requestBody['releaseCycleMapping'][0]['cycle'] = [rqLinkCycleId];
  requestBody['releaseCycleMapping'][0]['version'] = 1;
  requestBody['destinationProjectId'] = projectId;
  requestBody['entityData'][0]['entityId'] = testcaseCreatedId;
  requestBody['entityData'][0]['version'] = testcaseUpdateVersionId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Fetch Scope > Get List", function (transaction) {
  hooks.log("before Testcase > Fetch Scope > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityID'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > Remove Scope > Remove", function (transaction) {
  hooks.log("before Testcase > Remove Scope > Remove");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['sourceProjectId'] = projectId;
  requestBody['sourceReleaseId'] = rqLinkReleaseId;
  requestBody['sourceBuildId'] = rqLinkCycleId;
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > List Steps > Get List", function (transaction) {
  hooks.log("before Testcase > List Steps > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = testcaseCreatedId;
  requestBody['version'] = 2;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testcase > View Versions metadata > Get Details", function (transaction) {
  hooks.log("before Testcase > View Versions metadata > Get Details");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = testcaseCreatedId;
  transaction.request.body = JSON.stringify(requestBody);

  transaction.request.uri = transaction.request.uri.replace('139276', testcaseCreatedId);
  transaction.fullPath = transaction.fullPath.replace('139276', testcaseCreatedId);
});


// ********************************************************
// ********************** Testsuite ***********************
// ********************************************************

hooks.before("Testsuite > Create Folder > Create", function (transaction) {
  hooks.log("before Testsuite > Create Folder > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentId'] = testsuiteParentFolderId;
  requestBody['name'] = testsuiteFolderNameRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > List of folders > Get List", function (transaction) {
  hooks.log("before Testsuite > List of folders > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = testsuiteParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Folder Archieve > Folder Archieve", function (transaction) {
  hooks.log("before Testsuite > Folder Archieve > Folder Archieve");
  var result = responseStash.filter(element => element['uri'] == '/rest/testsuites/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderIDs'] = [id, testsuiteFolderIdArchieve];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Unarchieve > Unarchieve", function (transaction) {
  hooks.log("before Testsuite > Unarchieve > Unarchieve");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderIDs'] = [testsuiteFolderIdArchieve];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Delete Folder > Delete", function (transaction) {
  hooks.log("before Testsuite > Delete Folder > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/testsuites/folders');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var id = bodyJson['data'][0]['id'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Create/Update > Create", function (transaction) {
  hooks.log("before Testsuite > Create/Update > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['parentFolderId'] = testsuiteParentFolderId;
  requestBody['owner'] = userOwnerId;
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['name'] = testsuiteSummaryRandom;
  requestBody['releaseCycleMapping'][0]['buildID']= rqLinkCycleId;
  requestBody['releaseCycleMapping'][0]['releaseId']= rqLinkReleaseId;  
  transaction.request.body = JSON.stringify(requestBody);  
  hooks.log(transaction.request.body);
});

hooks.after("Testsuite > Create/Update > Create", function (transaction) {
  hooks.log("after Testsuite > Create/Update > Create");
  var bodyJson = JSON.parse(transaction.real.body);
  testsuiteCreatedId = bodyJson['data'][0]['id'];
  testsuiteCreatedEntityKey = bodyJson['data'][0]['ENTITY_KEY'];
});

hooks.before("Testsuite > Fetch Testsuites > Get List", function (transaction) {
  hooks.log("before Testsuite > Fetch Testsuites > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = testsuiteParentFolderId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Fetch Testsuite > Get List", function (transaction) {
  hooks.log("before Testsuite > Fetch Testsuite > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  requestBody['viewId'] = testsuiteViewId;
  requestBody['filter'] = "[]";
  requestBody['udfFilter'] = "[]";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Update > Update", function (transaction) {
  hooks.log("before Testsuite > Update > Update");

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityKey'] = testsuiteCreatedEntityKey;
  requestBody['TsFolderID'] = testsuiteParentFolderId;
  requestBody['id'] = testsuiteCreatedId;
  requestBody['name'] = testsuiteSummaryUpdateRandom;
  requestBody['ownUser'] = [userOwnerId];
  requestBody['owner'] = userOwnerId;
  requestBody['owneralias'] = userOwnerAlias;
  requestBody['tsState'] = [testsuiteStateId];
  requestBody['testSuiteState'] = testsuiteStateId;
  requestBody['testSuiteStateAlias'] = testsuiteStateAlias;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Clone > Clone", function (transaction) {
  hooks.log("before Testsuite > Clone > Clone");

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['srcFolderId'] = testsuiteParentFolderId;
  requestBody['destFolderId'] = testsuiteParentFolderId;
  requestBody['id'] = testsuiteCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Fetch Details > Get Details", function (transaction) {
  hooks.log("before Testsuite > Fetch Details > Get Details");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['id'] = testsuiteCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Archieve/ Unarchieve > Archieve", function (transaction) {
  hooks.log("before Testsuite > Archieve/ Unarchieve > Archieve");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [testsuiteIdForArchive, testsuiteIdDelete, testsuiteIdDeleteBG];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Archieve/ Unarchieve > Unarchieve", function (transaction) {
  hooks.log("before Testsuite > Archieve/ Unarchieve > Unarchieve");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = [testsuiteIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Delete - Background Process > Delete", function (transaction) {
  hooks.log("before Testsuite > Delete > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['ids'] = testsuiteIdDeleteBG;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Delete > Delete", function (transaction) {
  hooks.log("before Testsuite > Delete > Delete");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityIds'] = testsuiteIdDelete;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Add Scope > Add", function (transaction) {
  hooks.log("before Testsuite > Add Scope > Add");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['data'][0]['tsId'] = testsuiteCreatedId;
  requestBody['data'][0]['buildID'] = rqLinkCycleId;
  requestBody['data'][0]['releaseId'] = rqLinkReleaseId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Fetch Scope > Get List", function (transaction) {
  hooks.log("before Testsuite > Fetch Scope > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Remove Scope > Remove", function (transaction) {
  hooks.log("before Testsuite > Remove Scope > Remove");
  var result = responseStash.filter(element => element['uri'] == '/rest/testsuites/getReleaseCycleForTestSuite');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var dataJson = bodyJson['data']
  var tsReleaseCycleMapID;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['releaseName'] == rqLinkReleaseIdName && dataJson[i]['cycleName'] == rqLinkCycleIdName) {
      tsReleaseCycleMapID = dataJson[i]['tsReleaseCycleMapID'];
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsReleaseCycleMapID'] = tsReleaseCycleMapID;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Link Platforms > Link", function (transaction) {
  hooks.log("before Testsuite > Link Platforms > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmTsId'] = testsuiteCreatedId;
  requestBody['qmPlatformId'] = testsuiteLinkPlatformId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Fetch Linked Platforms > Get List", function (transaction) {
  hooks.log("before Testsuite > Fetch Linked Platforms > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Unlink Platforms > Unlink", function (transaction) {
  hooks.log("before Testsuite > Unlink Platforms > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmTsId'] = testsuiteCreatedId;
  requestBody['platformID'] = testsuiteLinkPlatformId;
  transaction.request.body = JSON.stringify(requestBody);
});


hooks.before("Testsuite > Update Linked Testcase Version > Update version", function (transaction) {
  hooks.log("before Testsuite > Update Linked Testcase Version > Update version");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcRunID'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Link Testcases > Link", function (transaction) {
  hooks.log("before Testsuite > Link Testcases > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedId;
  requestBody['tcIDs'] = [rqLinkTestcaseVersionId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Link Testcase > Link", function (transaction) {
  hooks.log("before Testsuite > Link Testcases > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedId;
  requestBody['tcvdIDs'] = [testcaseUpdateVersionId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Fetch linked Testcases > Get List", function (transaction) {
  hooks.log("before Testsuite > Fetch linked Testcases > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Unlink Testcases > Unlink", function (transaction) {
  hooks.log("before Testsuite > Unlink Testcases > Unlink");
  var result = responseStash.filter(element => element['uri'] == '/rest/testsuites/testcase/list');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var dataJson = bodyJson['data']
  var id;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['tsid'] == testsuiteCreatedId && dataJson[i]['tcVersionID'] == rqLinkTestcaseVersionId) {
      id = dataJson[i]['tctsID'];
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsID'] = testsuiteCreatedEntityKey;
  requestBody['tcIDs'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Unlink Testcase > Unlink", function (transaction) {
  hooks.log("before Testsuite > Unlink Testcase > Unlink");
  var result = responseStash.filter(element => element['uri'] == '/rest/testsuites/testcase/list');
  var bodyString = result[0]['body'];
  var bodyJson = JSON.parse(bodyString);
  var dataJson = bodyJson['data']
  var id;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['tsid'] == testsuiteCreatedId && dataJson[i]['tcVersionID'] == testcaseUpdateVersionId) {
      id = dataJson[i]['tctsID'];
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcTsIDs'] = id;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Assign Platform Owner to Execution > Assign", function (transaction) {
  hooks.log("before Testsuite > Assign Platform Owner to Execution > Assign");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['platformowner'] = userOwnerId;
  requestBody['qmAllowBulkEmail'] = "false";
  requestBody['tsRunIds'] = testsuiteRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Testsuite > Assign Tester to Execution > Assign tester", function (transaction) {
  hooks.log("before Testsuite > Assign Tester to Execution > Assign tester");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmAllowBulkEmail'] = "false";
  requestBody['qmTsRunId'] = testsuiteRunId;
  requestBody['tcrIDs'] = issueTestcaseRunId;
  requestBody['userId'] = userOwnerId;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// *********************** Execution ***********************
// ********************************************************

hooks.before("Execution > Fetch Executions > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Executions > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsFolderID'] = testsuiteParentFolderId;
  requestBody['tsID'] = testcaseTestsuiteId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Testcase Run IDs > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Testcase Run IDs > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tsrID'] = testsuiteRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Testcase Run ID > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Testcase Run ID > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['viewId'] = testcaseViewId;
  requestBody['tsrunID'] = testsuiteRunId;
  requestBody['filter'] = "[]";  
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Testcase Step Run > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Testcase Step Run > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcrID'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Teststeprun > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Teststeprun > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['tcrID'] = issueTestcaseRunId;
  requestBody['viewId'] = executionTestcaseStepRunViewId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Link Issues to the Testcase Run > Link", function (transaction) {
  hooks.log("before Execution > Link Issues to the Testcase Run > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueIds'] = [rqLinkIssueId];
  requestBody['tcrId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Linked Issue of Testcase run > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Linked Issue of Testcase run > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Link Issues to the Testcase Step Run > Link", function (transaction) {
  hooks.log("before Execution > Link Issues to the Testcase Step Run > Link");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueIds'] = [rqLinkIssueId];
  requestBody['tcsrId'] = issueTestcaseStepRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch Linked Issue of Testcase step run > Get List", function (transaction) {
  hooks.log("before Execution > Fetch Linked Issue of Testcase step run > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseStepRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Fetch linked Issues of Testcase Run or Testcase Step Run > Get List", function (transaction) {
  hooks.log("before Execution > Fetch linked Issues of Testcase Run or Testcase Step Run > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Unlink Issues from Testcase Run > Unlink", function (transaction) {
  hooks.log("before Execution > Unlink Issues from Testcase Run > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueIds'] = [rqLinkIssueId];
  requestBody['tcrId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Unlink Issues from Testcase Step Run > Unlink", function (transaction) {
  hooks.log("before Execution > Unlink Issues from Testcase Step Run > Unlink");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['issueIds'] = rqLinkIssueId;
  requestBody['tcsrId'] = issueTestcaseStepRunId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Reset Execution Status > Reset", function (transaction) {
  hooks.log("before Execution > Reset Execution Status > Reset");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['qmTsRunId'] = testsuiteRunId;
  requestBody['dropID'] = testsuiteDropId;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Bulkupdate Run status > Update", function (transaction) {
  hooks.log("before Execution > Bulkupdate Run status > Update");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['runStatusID'] = executionRunStatusId;
  requestBody['qmTsRunId'] = testsuiteRunId;
  requestBody['entityIDs'] = issueTestcaseRunId;
  requestBody['entityType'] = "TCR";
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Execution > Edit comments to Testcase Run and Testcase Step Run > Update", function (transaction) {
  hooks.log("before Execution > Edit comments to Testcase Run and Testcase Step Run > Update");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['entityId'] = issueTestcaseRunId;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ************************ Search ************************
// ********************************************************

hooks.before("Search > Search entities > Search Testcases", function (transaction) {
  hooks.log("before Search > Search entities > Search Testcases");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['folderPath'] = rqFolderPathWithProjectName;
  requestBody['filter'] = requestBody['filter'].replace(new RegExp("demoValue", 'g'), testcaseCreatedEntityKey);
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Search > Search entities > Search Issues", function (transaction) {
  hooks.log("before Search > Search entities > Search Issues");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['filters'][0]['filters'][0]['value'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][0]['rawValue'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['value'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['rawValue'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['value'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['rawValue'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['value'] = issueCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['rawValue'] = issueCreatedEntityKey;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Search > Search entities > Search Requirements", function (transaction) {
  hooks.log("before Search > Search entities > Search Requirements");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['filters'][0]['filters'][0]['value'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][0]['rawValue'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['value'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['rawValue'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['value'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['rawValue'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['value'] = rqCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['rawValue'] = rqCreatedEntityKey;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Search > Search entities > Search Test suites", function (transaction) {
  hooks.log("before Search > Search entities > Search Test suites");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['filters'][0]['filters'][0]['value'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][0]['rawValue'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['value'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][1]['rawValue'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['value'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][2]['rawValue'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['value'] = testsuiteCreatedEntityKey;
  requestBody['filters'][0]['filters'][3]['rawValue'] = testsuiteCreatedEntityKey;
  transaction.request.body = JSON.stringify(requestBody);
});


// ********************************************************
// ***************** Datagrid / Parameter *****************
// ********************************************************

hooks.before("Datagrid > Project List > List", function (transaction) {
  hooks.log("before Datagrid > Project List > List");
});

hooks.before("Datagrid > Add Parameter > Add", function (transaction) {
  hooks.log("before Datagrid > Add Parameter > Add");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['paramName'] = paramNameRandom;
  requestBody['paramDes'] = paramDescriptionRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > List Parameter > Get List", function (transaction) {
  hooks.log("before Datagrid > List Parameter > Get List");
});

hooks.before("Datagrid > Project List for Update > List", function (transaction) {
  hooks.log("before Datagrid > Project List for Update > List");
});

hooks.before("Datagrid > Update Parameter > Update", function (transaction) {
  hooks.log("before Datagrid > Update Parameter > Update");
  var result = responseStash.filter(element => element['uri'] == '/rest/parameter');
  var bodyString = result[0]['body'];
  var id = JSON.parse(bodyString)['data']['paramID'];
  transaction.request.uri = transaction.request.uri.replace('527', id);
  transaction.fullPath = transaction.fullPath.replace('527', id);
  var parameterValueID = JSON.parse(bodyString)['data']['value'][2]['paramValueID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['name'] = paramNameUpdateRandom;
  requestBody['deleteValue'][0]['parameterValueID'] = parameterValueID;
  
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Parameter Values > List", function (transaction) {
  hooks.log("before Datagrid > Parameter Values > List");
  var result = responseStash.filter(element => element['uri'] == '/rest/parameter');
  var bodyString = result[0]['body'];
  var id = JSON.parse(bodyString)['data']['paramID'];

  transaction.request.uri = transaction.request.uri.replace('588', id);
  transaction.fullPath = transaction.fullPath.replace('588', id);
});

hooks.before("Datagrid > Delete Parameter Values > Delete", function (transaction) {
  hooks.log("before Datagrid > Delete Parameter Values > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/parameter');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data'];
  var id = dataJson['value'][0]['paramValueID'];

  transaction.request.uri = transaction.request.uri.replace('3942', id);
  transaction.fullPath = transaction.fullPath.replace('3942', id);
});

hooks.before("Datagrid > Archive Parameter > Archive", function (transaction) {
  hooks.log("before Datagrid > Archive Parameter > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/parameter');
  var bodyString = result[0]['body'];
  var id = JSON.parse(bodyString)['data']['paramID'];

  var requestBody = JSON.parse(transaction.request.body);
  requestBody = [id, paramIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Unarchive Parameter > Unarchive", function (transaction) {
  hooks.log("before Datagrid > Unarchive Parameter > Unarchive");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody = [paramIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Delete Parameter > Delete", function (transaction) {
  hooks.log("before Datagrid > Delete Parameter > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/parameter');
  var bodyString = result[0]['body'];
  var id = JSON.parse(bodyString)['data']['paramID'];

  transaction.request.uri = transaction.request.uri.replace('510', id);
  transaction.fullPath = transaction.fullPath.replace('510', id);
});

// ********************************************************
// ****************** Datagrid / Datagrid *****************
// ********************************************************

hooks.before("Datagrid > Create > Create", function (transaction) {
  hooks.log("before Datagrid > Create > Create");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['projectIDs'] = [projectId];
  requestBody['name'] = datagridNameRandom;
  requestBody['parameters'][0]['paramID'] = paramIdForDatagrid;
  requestBody['parameters'][1]['paramID'] = paramIdForDatagrid1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > List > Get List", function (transaction) {
  hooks.log("before Datagrid > List > Get List");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody['filter'][1]['value'] = [projectId];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Get Detail > Get Detail", function (transaction) {
  hooks.log("before Datagrid > Get Detail > Get Detail");
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var id;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      id = dataJson[i]['id']
      break;
    }
  }
  transaction.request.uri = transaction.request.uri.replace('73', id);
  transaction.fullPath = transaction.fullPath.replace('73', id);
});

hooks.before("Datagrid > Save > Save", function (transaction) {
  hooks.log("before Datagrid > Save > Save");
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var id;

  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      id = dataJson[i]['id']
      break;
    }
  }
  var url = "/rest/datagrid/getById?dataGridID=" + id;
  var result = responseStash.filter(element => element['uri'] == url);
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['parameters'];
  var parentId;
  var paramValueId1;
  var paramValueId2;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['OrignalParamID'] == paramIdForDatagrid) {
      parentId = dataJson[i]['paramID'];
      paramValueId1 = dataJson[i]['parameterValues'][0]['parameterValueID'];
      paramValueId2 = dataJson[i]['parameterValues'][1]['parameterValueID'];
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody[0]['dataGridID'] = id;
  requestBody[0]['id'] = paramValueId1;
  requestBody[0]['parentID'] = parentId;
  requestBody[1]['dataGridID'] = id;
  requestBody[1]['id'] = paramValueId2;
  requestBody[1]['parentID'] = parentId;
  requestBody[2]['dataGridID'] = id;
  requestBody[3]['dataGridID'] = id;
  requestBody[3]['value'] = datagridNameUpdateRandom;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Update > Update", function (transaction) {
  hooks.log("before Datagrid > Update > Update");
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var id;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      id = dataJson[i]['id']
      break;
    }
  }

  var requestBody = JSON.parse(transaction.request.body);
  requestBody['dataGridID'] = id;
  requestBody['ID'] = paramIdForDatagrid1;
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Autofill Parameter Values > Autofill", function (transaction) {
  hooks.log("before Datagrid > Autofill Parameter Values > Autofill");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody = [paramIdForDatagrid, paramIdForDatagrid1];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Archive > Archive", function (transaction) {
  hooks.log("before Datagrid > Archive > Archive");
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var id;
  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      id = dataJson[i]['id']
      break;
    }
  }
  var requestBody = JSON.parse(transaction.request.body);
  requestBody = [dataGridIdForArchive, id];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Unarchive > Unarchive", function (transaction) {
  hooks.log("before Datagrid > Unarchive > Unarchive");
  var requestBody = JSON.parse(transaction.request.body);
  requestBody = [dataGridIdForArchive];
  transaction.request.body = JSON.stringify(requestBody);
});

hooks.before("Datagrid > Delete > Delete", function (transaction) {
  hooks.log("before Datagrid > Delete > Delete");
  var result = responseStash.filter(element => element['uri'] == '/rest/datagrid/getList');
  var bodyString = result[0]['body'];
  var dataJson = JSON.parse(bodyString)['data']['data'];
  var id;

  for (i = 0; i < dataJson.length; i++) {
    if (dataJson[i]['name'] == datagridNameRandom) {
      id = dataJson[i]['id']
      break;
    }
  }
  transaction.request.uri = transaction.request.uri.replace('73', id);
  transaction.fullPath = transaction.fullPath.replace('73', id);
});

hooks.before("Datagrid > Get Data Grid Ids for bulk opration > Get Data Grid Ids for bulk opration", function (transaction) {
  hooks.log("before Datagrid > Get Data Grid Ids for bulk opration > Get Data Grid Ids for bulk opration");
});

function clearFile() {
  fs.truncate('./logs.log', 0, function () { console.log('done') })
}

function writeFile(content) {
  fs.appendFile('./logs.log', content, function (err) {
    if (err) throw err;
    //console.log('Updated!' + content);
  });
}
