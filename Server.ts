import Socket from './Socket.ts'

interface Result {
  value: Socket
  done: false
}

export default class Server {
  server!: Deno.DatagramConn
  _promise!: Promise<Result>
  _reslove!: Function
  _uidToSocket: Map<string, Socket>

  constructor() {
    this._uidToSocket = new Map()
  }

  _createPromise() {
    this._promise = new Promise((res) => {
      this._reslove = res
    })
  }

  async _createServer(config: Deno.ListenOptions & { transport: 'udp' }) {
    this.server = Deno.listenDatagram(config)
    for await (const conn of this.server) {
      this._handle(conn)
    }
  }

  listen(config: Deno.ListenOptions & { transport: 'udp' }) {
    this._createServer(config)

    return {
      [Symbol.asyncIterator]: () => {
        return {
          next: () => {
            // bug?
            this._createPromise()
            return this._promise
          },
        }
      },
    }
  }

  _handle(conn: [Uint8Array, Deno.Addr]) {
    const uid = Server._makeUid(conn)
    let socket: Socket

    if (this._uidToSocket.has(uid)) {
      socket = this._uidToSocket.get(uid) as Socket
    } else {
      socket = new Socket(conn, this.server)
      socket._register(() => {
        this._reslove(Server._makeResult(socket))
      })
      this._uidToSocket.set(uid, socket)
    }

    socket._read()
  }

  static _makeResult(socket: Socket): Result {
    return {
      value: socket,
      done: false,
    }
  }

  static _makeUid(conn: [Uint8Array, Deno.Addr]): string {
    return (
      (conn[1] as Deno.NetAddr).hostname + ':' + (conn[1] as Deno.NetAddr).port
    )
  }
}

// const server = new Server().listen({
//   port: 80,
//   transport: 'udp',
// })
// for await (const socket of server) {
//   console.log(socket)
// }
