declare module 'vscode' {
  export interface ExtensionContext {
    readonly extensionUri: Uri;
  }
  /**
   * Represents a session of a currently logged in user.
   */
  export interface AuthenticationSession {
    /**
     * The identifier of the authentication session.
     */
    readonly id: string;

    /**
     * The access token.
     */
    readonly accessToken: string;

    /**
     * The account associated with the session.
     */
    readonly account: AuthenticationSessionAccountInformation;

    /**
     * The permissions granted by the session's access token. Available scopes
     * are defined by the [AuthenticationProvider](#AuthenticationProvider).
     */
    readonly scopes: ReadonlyArray<string>;
  }

  /**
   * The information of an account associated with an [AuthenticationSession](#AuthenticationSession).
   */
  export interface AuthenticationSessionAccountInformation {
    /**
     * The unique identifier of the account.
     */
    readonly id: string;

    /**
     * The human-readable name of the account.
     */
    readonly label: string;
  }

  /**
   * Options to be used when getting an [AuthenticationSession](#AuthenticationSession) from an [AuthenticationProvider](#AuthenticationProvider).
   */
  export interface AuthenticationGetSessionOptions {
    /**
     * Whether login should be performed if there is no matching session.
     *
     * If true, a modal dialog will be shown asking the user to sign in. If false, a numbered badge will be shown
     * on the accounts activity bar icon. An entry for the extension will be added under the menu to sign in. This
     * allows quietly prompting the user to sign in.
     *
     * Defaults to false.
     */
    createIfNone?: boolean;

    /**
     * Whether the existing user session preference should be cleared.
     *
     * For authentication providers that support being signed into multiple accounts at once, the user will be
     * prompted to select an account to use when [getSession](#authentication.getSession) is called. This preference
     * is remembered until [getSession](#authentication.getSession) is called with this flag.
     *
     * Defaults to false.
     */
    clearSessionPreference?: boolean;
  }

  /**
   * Basic information about an [authenticationProvider](#AuthenticationProvider)
   */
  export interface AuthenticationProviderInformation {
    /**
     * The unique identifier of the authentication provider.
     */
    readonly id: string;

    /**
     * The human-readable name of the authentication provider.
     */
    readonly label: string;
  }

  /**
   * An [event](#Event) which fires when an [AuthenticationSession](#AuthenticationSession) is added, removed, or changed.
   */
  export interface AuthenticationSessionsChangeEvent {
    /**
     * The [authenticationProvider](#AuthenticationProvider) that has had its sessions change.
     */
    readonly provider: AuthenticationProviderInformation;
  }

  /**
   * Namespace for authentication.
   */
  export namespace authentication {
    /**
     * Get an authentication session matching the desired scopes. Rejects if a provider with providerId is not
     * registered, or if the user does not consent to sharing authentication information with
     * the extension. If there are multiple sessions with the same scopes, the user will be shown a
     * quickpick to select which account they would like to use.
     *
     * Currently, there are only two authentication providers that are contributed from built in extensions
     * to VS Code that implement GitHub and Microsoft authentication: their providerId's are 'github' and 'microsoft'.
     * @param providerId The id of the provider to use
     * @param scopes A list of scopes representing the permissions requested. These are dependent on the authentication provider
     * @param options The [getSessionOptions](#GetSessionOptions) to use
     * @returns A thenable that resolves to an authentication session
     */
    export function getSession(
      providerId: string,
      scopes: string[],
      options: AuthenticationGetSessionOptions & { createIfNone: true }
    ): Thenable<AuthenticationSession>;

    /**
     * Get an authentication session matching the desired scopes. Rejects if a provider with providerId is not
     * registered, or if the user does not consent to sharing authentication information with
     * the extension. If there are multiple sessions with the same scopes, the user will be shown a
     * quickpick to select which account they would like to use.
     *
     * Currently, there are only two authentication providers that are contributed from built in extensions
     * to VS Code that implement GitHub and Microsoft authentication: their providerId's are 'github' and 'microsoft'.
     * @param providerId The id of the provider to use
     * @param scopes A list of scopes representing the permissions requested. These are dependent on the authentication provider
     * @param options The [getSessionOptions](#GetSessionOptions) to use
     * @returns A thenable that resolves to an authentication session if available, or undefined if there are no sessions
     */
    export function getSession(
      providerId: string,
      scopes: string[],
      options?: AuthenticationGetSessionOptions
    ): Thenable<AuthenticationSession | undefined>;
  }
}
