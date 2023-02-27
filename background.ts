import { Client, Server } from "@hanseltime/janus-simple-command";
import { click } from "./actions";
import {
  ExtensionCommandMap,
  ExtensionCommands,
  ExtensionStatusMap,
  ServerCommandMap,
  ServerCommands,
  ServerStatusMap,
} from "./types";
import { BrowserWebSocketConnection } from "./BrowserWebSocketConnection";

async function runAutomation() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab) {
    throw new Error("couldn't find tab");
  }
  const ws = new global.WebSocket("ws://localhost:9080");

  const extensionServer = new Server<
    ExtensionCommands,
    ExtensionCommandMap,
    ExtensionStatusMap
  >({
    maxSenderInactivity: 10000,
    maxAckRetries: 4,
    ackRetryDelay: 500,
    connection: new BrowserWebSocketConnection(ws, "server"),
    debug: console.debug,
  });

  const serverClient = new Client<
    ServerCommands,
    ServerCommandMap,
    ServerStatusMap
  >({
    commands: ["ready"],
    ackRetryDelay: 1000,
    maxAckRetries: 3,
    connection: new BrowserWebSocketConnection(ws, "client"),
    debug: console.debug,
  });

  extensionServer.setMessageHandler("click", {
    handler: async (msg) => {
      console.log("received click command with selector", msg.data.selector);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: click,
        args: [{ selector: msg.data.selector }],
      });
      return {
        isError: false,
        data: {},
      };
    },
  });

  await serverClient.open();
  await extensionServer.open();

  const sender = await serverClient.createSender();
  await sender.command("ready", {});
  await sender.close()
}

chrome.scripting.registerContentScripts([{
    id: 'teleport-button',
    js: ['button.js'],
    persistAcrossSessions: false,
    matches: ["http://*/*", "https://*/*"],
    runAt: "document_end"
}])

chrome.runtime.onMessage.addListener((message) => {
    console.log('service worker got message', message)
    if(message.data === 'START_TELEPORT') {
       void runAutomation() 
    }
})
