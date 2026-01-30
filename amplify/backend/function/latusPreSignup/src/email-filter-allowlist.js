/**
 * @type {import('@types/aws-lambda').PreSignUpTriggerHandler}
 */
exports.handler = async (event) => {
  const { email } = event.request.userAttributes;

  if ((email != 'olesnieadrian@gmail.com')
    && email != 'cofounder.latus@gmail.com'
    && email != 'omarsarafa@gmail.com'
    && email != 'social.latus@gmail.com'
    && email != 'mukendij@myhcdsb.org'
    && email != 'luisa.olesniewicz.507@my.werbr.ca'
    && !email.includes("@stfxavier.ca")) {
    throw new Error(`Invalid email domain...`);
  }

  return event;
};
