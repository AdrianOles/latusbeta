/**
 * @type {import('@types/aws-lambda').PreSignUpTriggerHandler}
 */
exports.handler = async (event) => {
  const { email } = event.request.userAttributes;

  const schoolList = [
    "@stfxavier.ca",
    "@gobluego.ca",
    "@loyola.hcdsb.org",
    "@my.aquinas.me",
    "@my.cccss.ca",
    "@my.ctk.ca",
    "@my.htoakville.ca",
    "@my.ntdm.ca",
    "@my.werbr.ca",
    "@hs.myhcdsb.org",
    "@myhcdsb.org"
  ]

  if ((email != 'olesnieadrian@gmail.com')
    && email != 'cofounder.latus@gmail.com'
    && email != 'omarsarafa@gmail.com'
    && email != 'social.latus@gmail.com'
    && !schoolList.find(school => email.endsWith(school))) {
    throw new Error(`Invalid email domain...`);
  }

  return event;
};
