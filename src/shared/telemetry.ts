import * as vscode from 'vscode';
const os = require('os');
const publicIp = require('public-ip');
const Amplitude = require('amplitude');

export class Telemetry {
  amplitude: any;
  userId: string;
  ip: string;
  isTelemetryEnabled: boolean;

  constructor() {
    this.userId = vscode.env.machineId;
    this.isTelemetryEnabled = false;
    this.ip = '';

    this.getSettingFromConfig();
    this.setup();
    vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this);
  }

  async setup() {
    if (!this.isTelemetryEnabled) {
      return;
    }

    if (this.amplitude) {
      return;
    }

    this.amplitude = new Amplitude('d3c2366d3c3e0712bdf2efdb3dd498c2');

    let extension = vscode.extensions.getExtension('giscafer.leek-fund');
    let extensionVersion = extension ? extension.packageJSON.version : '<none>';

    // Store
    this.ip = await publicIp.v4();

    // Amplitude
    this.amplitude.identify({
      user_id: this.userId,
      language: vscode.env.language,
      platform: os.platform(),
      app_version: extensionVersion,
      ip: this.ip,
      user_properties: {
        vscodeSessionId: vscode.env.sessionId,
        vscodeVersion: vscode.version,
      },
    });
  }

  sendEvent(eventName: string, params?: any) {
    if (!this.isTelemetryEnabled) {
      return;
    }

    /*   let data = {
      ...params,
      distinct_id: this.userId,
      ip: this.ip,
    }; */

    // Amplitude
    this.amplitude.track({
      event_type: eventName,
      event_properties: params,
      user_id: this.userId,
      ip: this.ip,
    });
  }

  configurationChanged() {
    // vscode.window.showInformationMessage('Updated');
    this.getSettingFromConfig();
  }

  private getSettingFromConfig() {
    let config = vscode.workspace.getConfiguration('telemetry');
    if (config) {
      let enableTelemetry = config.get<boolean>('enableTelemetry');
      this.isTelemetryEnabled = !!enableTelemetry;
    }
    if (this.isTelemetryEnabled) {
      this.setup();
    }
  }
}
