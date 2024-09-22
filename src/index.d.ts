declare class EventEmitter {
  private #events: Record<string, Array<(data: any) => void>>;

  constructor();

  /**
   * Registers a listener for the specified event.
   * @param {string} eventName - The name of the event to listen for.
   * @param {(data: any) => void} listener - The callback function to invoke when the event is emitted.
   */
  on(eventName: string, listener: (data: any) => void): void;

  /**
   * Removes a listener for the specified event.
   * @param {string} eventName - The name of the event.
   * @param {(data: any) => void} listener - The listener function to remove.
   */
  off(eventName: string, listener: (data: any) => void): void;

  /**
   * Emits an event, invoking all registered listeners.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} [data] - The data to pass to each listener.
   */
  emit(eventName: string, data?: any): void;
}

/**
 * Class representing Guerrillamail functionality.
 * Extends EventEmitter to handle inbox events.
 */
declare class Guerrillamail extends EventEmitter {
  private #api_token: string;
  private #sid_token: string;
  private #interval: NodeJS.Timeout | null;
  private #intervalTime: number;
  private #intervalCheck: boolean;
  inbox: Array<GuerrillamailEmail>;

  /**
   * Initializes a new Guerrillamail instance.
   */
  constructor();

  /**
   * Sets the interval time for checking the inbox.
   * @param {number} [time=10] - The time interval in seconds.
   */
  set intervalTime(time: number);

  /**
   * Gets the interval time for checking the inbox.
   * @returns {number} The interval time in seconds.
   */
  get intervalTime(): number;

  /**
   * Sets whether the interval check should be active.
   * @param {boolean} [check=true] - Whether the interval check is enabled.
   */
  set intervalCheck(check: boolean);

  /**
   * Gets whether the interval check is enabled.
   * @returns {boolean} Whether the interval check is enabled.
   */
  get intervalCheck(): boolean;

  /**
   * Initializes the Guerrillamail instance by fetching tokens and email addresses.
   * @throws Will throw an error if initialization fails.
   */
  initialize(): Promise<void>;

  /**
   * Sets a new email user.
   * @param {string} [new_mail_id=""] - The new mail ID to set.
   * @throws Will throw an error if setting the email user fails.
   */
  setMailUser(new_mail_id?: string): Promise<void>;

  /**
   * Fetches the list of emails in the inbox.
   * @returns {Promise<Array<GuerrillamailEmail>>} An array of email objects.
   * @throws Will throw an error if fetching the inbox fails.
   */
  getInbox(): Promise<Array<GuerrillamailEmail>>;

  /**
   * Fetches a specific email by its ID.
   * @param {string} [mail_id=""] - The ID of the email to fetch.
   * @returns {Promise<GuerrillamailFetchedEmail>} The email data.
   * @throws Will throw an error if fetching the email fails.
   */
  fetchEmail(mail_id?: string): Promise<GuerrillamailFetchedEmail>;

  /**
   * Clears the inbox by deleting all emails.
   * @returns {Promise<boolean>} True if the data was successfully cleared.
   * @throws Will throw an error if clearing the data fails.
   */
  clearData(): Promise<boolean>;
}

export = Guerrillamail;

/**
 * Interface representing an email in the inbox.
 */
interface GuerrillamailEmail {
  mail_timestamp: number | string;
  mail_date: string;
  mail_id: string | number;
  mail_from: string;
  mail_recipient: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_body?: string;
  mail_size: number | string;
}

/**
 * Interface representing the full data of a fetched email.
 */
interface GuerrillamailFetchedEmail extends GuerrillamailEmail {
  content_type: string;
  mail_read: number | string;
  sid_token: string;
  ver?: string;
  auth: {
    success: boolean;
    error_codes: Array<any>;
  };
}

