import {
  Connection,
  messageIsForClient,
  messageIsForServer,
  tryToGetMessageObject,
} from '@hanseltime/janus-simple-command'

export class BrowserWebSocketConnection implements Connection {
  private messageHandler: ((msg: string) => Promise<void>) | undefined
  private errorHandler: ((error: Error) => Promise<void>) | undefined
  private closeHandler: (() => Promise<void>) | undefined

  private connect: Promise<void>
  private cancelConnect: ((error: Error) => void) | undefined
  private pending = new Set<Promise<any>>()

  constructor(private ws: WebSocket, private type: 'server' | 'client') {
    this.connect = new Promise<void>((res, reject) => {
      if (ws.readyState === WebSocket.CONNECTING) {
        this.cancelConnect = reject
        ws.addEventListener('open', () => {
          this.cancelConnect = undefined
          res()
        })
        return
      }
      if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
        throw new Error('Attempting to make a connection from a closing Websocket')
      }
      res()
    })
    ws.addEventListener('message', ({data}) => {
      if (!this.messageHandler) return
      const msg = data.toString()
      const msgObj = tryToGetMessageObject(msg)
      const appliesToConnection =
        (this.type === 'client' && messageIsForClient(msgObj as any)) ||
        (this.type === 'server' && messageIsForServer(msgObj as any))
      if (!appliesToConnection) return

      const prom = this.messageHandler(data.toString()).finally(() => {
        this.pending.delete(prom)
      })
      this.pending.add(prom)
    })
    ws.addEventListener('error', (event) => {
      if (!this.errorHandler) return
      const prom = this.errorHandler(event as any).finally(() => {
        this.pending.delete(prom)
      })
      this.pending.add(prom)
    })
    ws.addEventListener('close', () => {
      if (!this.closeHandler) return
      const prom = this.closeHandler().finally(() => {
        this.pending.delete(prom)
      })
    })
  }
  async open(): Promise<void> {
    await this.connect
  }
  async sendMessage(msg: string): Promise<void> {
    this.ws.send(msg)
  }
  onMessage(messageHandler: (msg: string) => Promise<void>): void {
    this.messageHandler = messageHandler
  }
  onError(errorHandler: (error: Error) => Promise<void>): void {
    this.errorHandler = errorHandler
  }
  onClose(closeHandler: () => Promise<void>): void {
    this.closeHandler = closeHandler
  }

  async close(): Promise<void> {
    if (this.cancelConnect) {
      this.cancelConnect(new Error('Close called before connection'))
    }
    await Promise.allSettled(this.pending)
    this.ws.close()
  }
}
