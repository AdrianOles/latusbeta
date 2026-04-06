const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  GetGroupCommand,
  CreateGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({});

/**
 * @type {import('@types/aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event) => {
  const userEmail = event.request.userAttributes.email;

  // Check if the email contains numbers using a regular expression
  const digitCount = (userEmail.match(/\d/g) || []).length;
  let groupParams;
  let addUserParams;

  //Within school
  if (digitCount > 2) {
    groupParams = {
      GroupName: 'STUDENT',
      UserPoolId: event.userPoolId,
    };
    addUserParams = {
      GroupName: 'STUDENT',
      UserPoolId: event.userPoolId,
      Username: event.userName,
    };
  } else {
    groupParams = {
      GroupName: 'TEACHER',
      UserPoolId: event.userPoolId,
    };
    addUserParams = {
      GroupName: 'TEACHER',
      UserPoolId: event.userPoolId,
      Username: event.userName,
    };
  }
  /**
   * Check if the group exists; if it doesn't, create it.
   */
  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(groupParams));
  } catch (e) {
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand(groupParams));
  }
  /**
   * Then, add the user to the group.
   */
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addUserParams));


  // -------------------------------------------------------------------------
  let schoolAccess = 'STFX';
  if (userEmail.endsWith("@gobluego.ca")) {
    schoolAccess = 'AS';
  }
  if (userEmail.endsWith("@loyola.hcdsb.org")) {
    schoolAccess = 'LOY';
  }
  if (userEmail.endsWith("@my.aquinas.me")) {
    schoolAccess = 'STA';
  }
  if (userEmail.endsWith("@my.cccss.ca")) {
    schoolAccess = 'CC';
  }
  if (userEmail.endsWith("@my.ctk.ca")) {
    schoolAccess = 'CTK';
  }
  if (userEmail.endsWith("@my.htoakville.ca")) {
    schoolAccess = 'HT';
  }
  if (userEmail.endsWith("@my.ntdm.ca")) {
    schoolAccess = 'ND';
  }
  if (userEmail.endsWith("@my.werbr.ca")) {
    schoolAccess = 'BR';
  }
  if (userEmail.endsWith("@hs.myhcdsb.org")) {
    schoolAccess = 'STK';
  } 
  if (userEmail.endsWith("@myhcdsb.org")) {
    schoolAccess = 'DEMO';
  } 

  const schoolGroupParams = {
    GroupName: schoolAccess,
    UserPoolId: event.userPoolId,
  };
  const addSchoolParams = {
    GroupName: schoolAccess,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };

  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(schoolGroupParams));
  } catch (e) {
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand(schoolGroupParams));
  }
  /**
   * Then, add the user to the group.
   */
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addSchoolParams));

  //----------------------------------------------------------------------
  let boardAccess = 'HCDSB';

  const boardGroupParams = {
    GroupName: boardAccess,
    UserPoolId: event.userPoolId,
  };
  const addBoardParams = {
    GroupName: boardAccess,
    UserPoolId: event.userPoolId,
    Username: event.userName,
  };

  try {
    await cognitoIdentityServiceProvider.send(new GetGroupCommand(boardGroupParams));
  } catch (e) {
    await cognitoIdentityServiceProvider.send(new CreateGroupCommand(boardGroupParams));
  }
  /**
   * Then, add the user to the group.
   */
  await cognitoIdentityServiceProvider.send(new AdminAddUserToGroupCommand(addBoardParams));

  return event;
};