import Status from './Status.ts'

export default class Socket {
  buffer: Uint8Array
  server: Deno.DatagramConn
  addr: Deno.Addr
  _notify!: Function
  status: Status

  constructor(conn: [Uint8Array, Deno.Addr], server: Deno.DatagramConn) {
    this.buffer = conn[0]
    this.addr = conn[1]
    this.server = server
    this.status = Status.LISTEN
  }

  _read() {
    switch (this.status) {
    }
  }

  write(p: Uint8Array) {
    this.server.send(p, this.addr)
  }

  _register(cb: Function) {
    this._notify = cb
  }
}
