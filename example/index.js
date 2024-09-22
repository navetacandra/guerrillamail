const Guerrillamail = require("../");

(async () => {
  const guerrillamail = new Guerrillamail();
  
  // Listen for new emails
  guerrillamail.on("inbox", async (mail) => {
    const detail = await guerrillamail.fetchEmail(mail.mail_id);
    console.log(detail.mail_subject)
  });
  
  // Initialize Guerrillamail
  await guerrillamail.initialize();

  // Set custom mail user
  await guerrillamail.setMailUser('dummy.guerrillamail');

  // Set interval time more faster (default: 10)
  // Minimum is 5 seconds for preventing rate limit
  guerrillamail.intervalTime = 5;

  // Activate interval check (default: true)
  guerrillamail.intervalCheck = true;

  // Get inbox manually
  await guerrillamail.getInbox();

  // Clear all received emails
  await guerrillamail.clearData();
})();
