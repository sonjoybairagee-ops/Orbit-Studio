/* ============================================================
 * CompX — a very small WebSocket server
 *
 * The Figma plugin can only talk to After Effects over a socket, and a CEP
 * panel has Node but no ws module to install. This is the minimum of RFC 6455
 * needed for one trusted local client: the handshake, masked text frames from
 * the client, ping/pong, and close.
 *
 * It listens on the loopback address only and never acts on anything the
 * client says beyond handing complete text messages to the caller.
 * ============================================================ */
(function (global) {
  "use strict";

  var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  var MAX_MESSAGE = 32 * 1024 * 1024;   // a pasted artboard, not a video

  function requireNode(name) {
    try {
      var req = (typeof require !== "undefined") ? require
        : (global.cep_node && global.cep_node.require) ? global.cep_node.require : null;
      return req ? req(name) : null;
    } catch (e) { return null; }
  }

  function acceptKey(key, crypto) {
    return crypto.createHash("sha1").update(String(key) + GUID, "utf8").digest("base64");
  }

  // Reads the request line and headers out of the opening handshake.
  function parseHandshake(text) {
    var head = String(text).split("\r\n\r\n")[0];
    var lines = head.split("\r\n");
    var request = lines.shift() || "";
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
      var colon = lines[i].indexOf(":");
      if (colon < 0) continue;
      headers[lines[i].substring(0, colon).toLowerCase().replace(/\s+$/, "")] =
        lines[i].substring(colon + 1).replace(/^\s+|\s+$/g, "");
    }
    return { request: request, headers: headers };
  }

  function handshakeResponse(key, crypto) {
    return "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      "Sec-WebSocket-Accept: " + acceptKey(key, crypto) + "\r\n\r\n";
  }

  // Server frames are never masked, and the only ones sent here are small.
  function encodeFrame(opcode, payload, BufferCtor) {
    var body = BufferCtor.isBuffer(payload) ? payload : BufferCtor.from(String(payload), "utf8");
    var header;
    if (body.length < 126) {
      header = BufferCtor.alloc(2);
      header[1] = body.length;
    } else if (body.length < 65536) {
      header = BufferCtor.alloc(4);
      header[1] = 126;
      header.writeUInt16BE(body.length, 2);
    } else {
      header = BufferCtor.alloc(10);
      header[1] = 127;
      header.writeUInt32BE(Math.floor(body.length / 4294967296), 2);
      header.writeUInt32BE(body.length % 4294967296, 6);
    }
    header[0] = 0x80 | (opcode & 0x0f);
    return BufferCtor.concat([header, body]);
  }

  // Pulls every complete frame out of the buffer, leaving any partial tail.
  // Returns { frames: [{opcode, payload}], rest: Buffer, error: string|null }
  function decodeFrames(buffer, BufferCtor) {
    var frames = [];
    var offset = 0;
    while (offset + 2 <= buffer.length) {
      var first = buffer[offset];
      var second = buffer[offset + 1];
      var fin = (first & 0x80) !== 0;
      var opcode = first & 0x0f;
      var masked = (second & 0x80) !== 0;
      var length = second & 0x7f;
      var cursor = offset + 2;

      if (length === 126) {
        if (cursor + 2 > buffer.length) break;
        length = buffer.readUInt16BE(cursor);
        cursor += 2;
      } else if (length === 127) {
        if (cursor + 8 > buffer.length) break;
        var high = buffer.readUInt32BE(cursor);
        var low = buffer.readUInt32BE(cursor + 4);
        length = high * 4294967296 + low;
        cursor += 8;
      }
      if (length > MAX_MESSAGE) return { frames: frames, rest: buffer, error: "message too large" };
      // Everything a browser sends is masked; an unmasked client frame is a
      // protocol error rather than something to be lenient about.
      if (!masked) return { frames: frames, rest: buffer, error: "client frame was not masked" };
      if (cursor + 4 > buffer.length) break;
      var mask = buffer.slice(cursor, cursor + 4);
      cursor += 4;
      if (cursor + length > buffer.length) break;

      var payload = BufferCtor.alloc(length);
      for (var i = 0; i < length; i++) payload[i] = buffer[cursor + i] ^ mask[i & 3];
      cursor += length;

      frames.push({ fin: fin, opcode: opcode, payload: payload });
      offset = cursor;
    }
    return { frames: frames, rest: buffer.slice(offset), error: null };
  }

  // One client at a time; a second connection replaces the first, which is
  // what happens naturally when the Figma plugin is reopened.
  function createServer(options) {
    var net = requireNode("net");
    var crypto = requireNode("crypto");
    var BufferCtor = (typeof Buffer !== "undefined") ? Buffer : (requireNode("buffer") || {}).Buffer;
    if (!net || !crypto || !BufferCtor) throw new Error("Node is not available in this panel build.");

    var port = Number(options.port) || 7867;
    var onMessage = options.onMessage || function () {};
    var onStatus = options.onStatus || function () {};
    var client = null;

    var server = net.createServer(function (socket) {
      var buffer = BufferCtor.alloc(0);
      var upgraded = false;
      var message = null;     // accumulates continuation frames
      var messageOpcode = 0;

      socket.on("error", function () { try { socket.destroy(); } catch (e) {} });

      socket.on("data", function (chunk) {
        buffer = BufferCtor.concat([buffer, chunk]);

        if (!upgraded) {
          var headerEnd = buffer.indexOf("\r\n\r\n");
          if (headerEnd < 0) {
            if (buffer.length > 16384) { socket.destroy(); }
            return;
          }
          var parsed = parseHandshake(buffer.slice(0, headerEnd + 4).toString("utf8"));
          var key = parsed.headers["sec-websocket-key"];
          if (!key || !/^GET /.test(parsed.request)) {
            socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
            return;
          }
          socket.write(handshakeResponse(key, crypto));
          upgraded = true;
          buffer = buffer.slice(headerEnd + 4);
          if (client && client !== socket) { try { client.destroy(); } catch (e) {} }
          client = socket;
          onStatus("connected");
          try { socket.write(encodeFrame(1, JSON.stringify({ type: "hello", app: "CompX Orbit Studio" }), BufferCtor)); }
          catch (e) {}
        }

        var read = decodeFrames(buffer, BufferCtor);
        buffer = read.rest;
        if (read.error) {
          onStatus("error:" + read.error);
          try { socket.destroy(); } catch (e) {}
          return;
        }
        for (var i = 0; i < read.frames.length; i++) {
          var frame = read.frames[i];
          if (frame.opcode === 8) {                       // close
            try { socket.end(encodeFrame(8, BufferCtor.alloc(0), BufferCtor)); } catch (e) {}
            return;
          }
          if (frame.opcode === 9) {                       // ping
            try { socket.write(encodeFrame(10, frame.payload, BufferCtor)); } catch (e) {}
            continue;
          }
          if (frame.opcode === 10) continue;              // pong
          if (frame.opcode === 1 || frame.opcode === 2) {
            message = frame.payload;
            messageOpcode = frame.opcode;
          } else if (frame.opcode === 0 && message) {
            message = BufferCtor.concat([message, frame.payload]);
          } else {
            continue;
          }
          if (!frame.fin) continue;
          if (messageOpcode === 1 && message) {
            var text = message.toString("utf8");
            message = null;
            try { onMessage(text, socket); } catch (e) { onStatus("error:" + String(e.message || e)); }
          } else {
            message = null;
          }
        }
      });

      socket.on("close", function () {
        if (client === socket) { client = null; onStatus("waiting"); }
      });
    });

    server.on("error", function (error) { onStatus("error:" + String(error.message || error)); });
    // Loopback only: nothing outside this machine can reach the bridge.
    server.listen(port, "127.0.0.1", function () { onStatus("waiting"); });

    return {
      port: port,
      send: function (text) {
        if (!client) return false;
        try { client.write(encodeFrame(1, text, BufferCtor)); return true; }
        catch (e) { return false; }
      },
      close: function () {
        try { if (client) client.destroy(); } catch (e) {}
        client = null;
        try { server.close(); } catch (e) {}
        onStatus("stopped");
      }
    };
  }

  global.CompXWS = {
    createServer: createServer,
    acceptKey: acceptKey,
    parseHandshake: parseHandshake,
    handshakeResponse: handshakeResponse,
    encodeFrame: encodeFrame,
    decodeFrames: decodeFrames,
    MAX_MESSAGE: MAX_MESSAGE
  };
})(typeof window !== "undefined" ? window : this);
