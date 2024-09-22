const { EventEmitter } = require("./event");
const { request } = require("./request");

/**
 * Class representing Guerrillamail functionality.
 * Extends EventEmitter to handle inbox events.
 */
class Guerrillamail extends EventEmitter {
  #api_token = "";
  #sid_token = "";
  #interval = null;
  #intervalTime = 10 * 1000; // seconds
  #intervalCheck = true;
  inbox = [];

  /**
   * Initializes a new Guerrillamail instance.
   */
  constructor() {
    super();
  }

  /**
   * Interval function that checks for new emails.
   * @private
   */
  #intervalFunction = async () => {
    if (!(this.intervalCheck && this.intervalTime > 0 && this.#api_token))
      return;
    try {
      await this.getInbox();
    } catch (err) {
      throw err;
    }
  };

  /**
   * Sets the interval time for checking the inbox.
   * @param {number} [time=10] - The time interval in seconds.
   */
  set intervalTime(time = 10) {
    if (time > 5) {
      this.#intervalTime = time * 1000;
      this.#interval = setInterval(this.#intervalFunction, this.intervalTime);
    } else {
      this.#interval = null;
    }
  }

  /**
   * Gets the interval time for checking the inbox.
   * @returns {number} The interval time in seconds.
   */
  get intervalTime() {
    return this.#intervalTime / 1000;
  }

  /**
   * Sets whether the interval check should be active.
   * @param {boolean} [check=true] - Whether the interval check is enabled.
   */
  set intervalCheck(check = true) {
    this.#intervalCheck = !!check;
    if (this.#intervalCheck) {
      this.#interval = setInterval(
        this.#intervalFunction,
        this.intervalTime * 1000,
      );
    } else {
      this.#interval = null;
    }
  }

  /**
   * Gets whether the interval check is enabled.
   * @returns {boolean} Whether the interval check is enabled.
   */
  get intervalCheck() {
    return this.#intervalCheck;
  }

  /**
   * Initializes the Guerrillamail instance by fetching tokens and email addresses.
   * @async
   * @throws Will throw an error if initialization fails.
   */
  async initialize() {
    try {
      const html = await request("https://www.guerrillamail.com/inbox");

      const mail_id = html.match(/id="inbox-id">(.*?)<\/span> @/)[1];
      const host = html.match(/display_host: '(.*?)',/)[1];
      const api_token = html.match(/api_token : '(.*?)',/)[1];
      const sid_token = html.match(/"sid_token":"(.*?)",/)[1];
      const real_email = mail_id + "@guerrillamailblock.com";
      const email = mail_id + "@" + host;

      this.#api_token = api_token;
      this.#sid_token = sid_token;
      this.real_email = real_email;
      this.email = email;

      if (this.#intervalCheck) {
        this.getInbox();
        this.#interval = setInterval(
          this.#intervalFunction,
          this.#intervalTime,
        );
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Sets a new email user.
   * @param {string} [new_mail_id=""] - The new mail ID to set.
   * @async
   * @throws Will throw an error if setting the email user fails.
   */
  async setMailUser(new_mail_id = "") {
    try {
      const setEmailUserRequest = await request(
        "https://www.guerrillamail.com/ajax.php?f=set_email_user",
        {
          headers: {
            authorization: `ApiToken ${this.#api_token}`,
            cookie: `PHPSESSID=${this.#sid_token}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: `email_user=${new_mail_id}&lang=en&site=guerrillamail.com&in=+Set+cancel`,
          method: "POST",
        },
      );
      const isMailUserSetted = !!JSON.parse(setEmailUserRequest)?.auth?.success;
      if (!isMailUserSetted) throw new Error("Failed to set email user");
      this.real_email = new_mail_id + "@guerrillamailblock.com";
      this.email = new_mail_id + "@" + this.email.split("@")[1];
      this.getInbox();

      if (this.#intervalCheck) {
        this.#interval = setInterval(
          this.#intervalFunction,
          this.#intervalTime,
        );
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Fetches the list of emails in the inbox.
   *
   * @async
   * @returns {Promise<Array<{ mail_timestamp: number|string, mail_date: string, mail_id: string|number, mail_from: string, mail_recipient: string, mail_subject: string, mail_excerpt: string, mail_body: string|undefined, size: string|number }>>} An array of email objects, where each object contains the following properties:
   * @throws Will throw an error if fetching the inbox fails.
   */
  async getInbox() {
    try {
      const data = await request(
        `https://www.guerrillamail.com/ajax.php?f=get_email_list&offset=0&site=guerrillamail.com&in=${this.email.split("@")[0]}&_=${Date.now()}`,
        {
          headers: {
            authorization: `ApiToken ${this.#api_token}`,
            cookie: `PHPSESSID=${this.#sid_token}`,
          },
        },
      );

      const { list } = JSON.parse(data);
      if (this.inbox.length != (list ?? []).length) {
        if ((list ?? []).length > 0) {
          if (this.inbox.length < 1) {
            list.forEach((mail) => {
              this.emit("inbox", mail);
            });
          } else {
            this.emit("inbox", list[0]);
          }
        }
        this.inbox = list;
      }
      return list;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Fetches a specific email by its ID.
   *
   * @param {string} [mail_id=""] - The ID of the email to fetch.
   * @async
   * @returns {Promise<{ content_type: string, mail_read: number|string, mail_size: number|string, sid_token: string, ver: string|undefined, mail_timestamp: number|string, mail_date: string, mail_id: string|number, mail_from: string, mail_recipient: string, mail_subject: string, mail_excerpt: string, mail_body: string, auth: { success: boolean, error_codes: Array }}>} The email data, which includes the following properties:
   * 
   * @throws Will throw an error if fetching the email fails.
   */
  async fetchEmail(mail_id = "") {
    try {
      const data = await request(
        `https://www.guerrillamail.com/ajax.php?f=fetch_email&email_id=mr_${mail_id}&site=guerrillamail.com&in=${this.email.split("@")[0]}&_=${Date.now()}`,
        {
          headers: {
            authorization: `ApiToken ${this.#api_token}`,
            cookie: `PHPSESSID=${this.#sid_token}`,
          },
          body: null,
          method: "GET",
        },
      );
      return JSON.parse(data);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Clears the inbox by deleting all emails.
   * @async
   * @returns {boolean} True if the data was successfully cleared.
   * @throws Will throw an error if clearing the data fails.
   */
  async clearData() {
    try {
      const mail_ids = this.inbox.map((mail) => mail.mail_id);
      const deleteRequest = await request(
        "https://www.guerrillamail.com/ajax.php?f=del_email",
        {
          headers: {
            authorization: `ApiToken ${this.#api_token}`,
            cookie: `PHPSESSID=${this.#sid_token}`,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: `${mail_ids.map((id) => "email_ids%5B%5D=" + id).join("&")}&site=guerrillamail.com&in=navetacandra`,
          method: "POST",
        },
      );
      const isDeleted = !!JSON.parse(deleteRequest)?.auth?.success;
      if (!isDeleted) throw new Error("Failed to clear data");
      return isDeleted;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = Guerrillamail;
