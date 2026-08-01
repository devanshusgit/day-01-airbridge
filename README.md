# AirBridge

**Day 1 of 60 — 60 Days Fires**

A clean, peer-to-peer file-transfer web app. Two devices connect using a short room code and send one file directly to each other over a WebRTC DataChannel — the file itself never touches a server.

> Built as a one-day prototype. See [Prototype limitations](#prototype-limitations) before relying on it for anything beyond a demo.

## Screenshot

> _Add a screenshot of the hero screen and an active transfer here (e.g. `docs/screenshot-hero.png`, `docs/screenshot-transfer.png`)._

## Features

- Create a room and get a short, shareable room code
- Join a room using that code
- Direct peer-to-peer connection via WebRTC (no relay of file data through a server)
- Transfer one file at a time, in chunks
- Live file metadata: name, size, and type, shown before the transfer starts
- Real-time transfer progress (bytes transferred, percentage)
- Explicit connect / transferring / success / error states, communicated with both icon and text
- Receiver must accept or decline an incoming file before it transfers
- Download the completed file as a Blob on the receiving device
- Reset button on both sides to start a new transfer
- Responsive layout for mobile and desktop
- Keyboard accessible, with visible focus states and `aria-live` status announcements

## How it works

1. **Sender** opens AirBridge and selects "Send a file." A room code is generated and a `Peer` is created using that code as its ID.
2. **Receiver** opens AirBridge, selects "Receive a file," and enters the code. Their browser connects directly to the sender's peer ID.
3. Once the WebRTC DataChannel is open, the sender picks a file and clicks "Send." A small JSON message describing the file (name, size, type) is sent first.
4. The receiver sees the incoming file details and must **Accept** before any bytes are sent.
5. The file is sliced into 16 KB chunks and sent over the DataChannel, with backpressure handling (the sender pauses if the channel's buffered amount grows too large).
6. The receiver reassembles the chunks in order into a `Blob` and offers it as a download. No chunk is ever written to a server.

## Architecture

- **Signalling**: [PeerJS](https://peerjs.com/) and its free public cloud broker handle the WebRTC handshake (exchanging SDP offers/answers and ICE candidates). The broker only ever sees connection metadata — never file contents.
- **Room codes**: a 6-character code (from an unambiguous alphabet, excluding characters like `0`/`O`/`1`/`I`) is generated client-side and used as a namespaced PeerJS peer ID (`airbridge-XXXXXX`), so the receiver can connect to the sender directly.
- **Data transport**: once connected, all file bytes flow over the WebRTC `RTCDataChannel` directly between the two browsers. Control messages (file metadata, accept/decline, completion, errors) are small JSON objects sent over the same channel.
- **State machine**: a single hook, `usePeerTransfer`, owns connection state and transfer state for both roles (sender and receiver), so the UI is a straightforward function of that state.

### On relays and privacy

WebRTC first attempts a direct connection between the two devices. If a direct path isn't possible (for example, behind certain NATs or firewalls), WebRTC normally falls back to a TURN relay server. This prototype only configures public STUN servers (for NAT traversal discovery) and does **not** configure a TURN relay, so some restrictive networks may fail to connect directly. In no case does AirBridge upload or store the transferred file on its own server — the file only ever travels through the browsers' own WebRTC connection (direct, or via a generic WebRTC relay if your network requires one).

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [PeerJS](https://peerjs.com/) for WebRTC signalling and data channels
- [Lucide React](https://lucide.dev/) for icons
- [Framer Motion](https://www.framer.com/motion/) for small, restrained transitions
- Deployed on [Vercel](https://vercel.com/)

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To test a real transfer, open the app in two separate browser tabs, browser profiles, or devices — create a room in one and join it from the other.

## Available scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## Environment variables

None. AirBridge uses PeerJS's free public signalling broker out of the box, so no API keys or server credentials are required.

## Testing instructions

Manual testing is the primary way to verify this prototype (there is no automated test suite in this one-day scope):

1. Run `npm run dev` and open `http://localhost:3000` in two separate tabs (or two devices on the same network).
2. In tab A, click **Send a file** and note the generated room code.
3. In tab B, click **Receive a file**, enter the code, and join.
4. Once both sides show "connected," select a file in tab A and click **Send**.
5. In tab B, review the incoming file details and click **Accept**.
6. Watch progress update on both sides, then download the file in tab B and confirm it matches the original.
7. Try edge cases: entering an invalid room code, declining a transfer, closing one tab mid-transfer, and using **Start over** on either side.

## Deployment (Vercel)

1. Push this project to a Git repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Framework preset: Next.js (auto-detected). No environment variables are required.
4. Deploy — the app is fully static/client-driven aside from Next's server rendering shell, so no additional configuration is needed.

## Privacy

- The transferred file is never uploaded to, or stored on, any AirBridge server — it travels directly between the two browsers over WebRTC.
- The signalling broker (PeerJS's public cloud service) only relays connection setup metadata (peer IDs, session descriptions, ICE candidates), not file data.
- WebRTC may still route traffic through a generic relay server if a direct connection can't be established on your network; see [On relays and privacy](#on-relays-and-privacy) above. AirBridge does not claim perfect anonymity or that your network path is never observable to WebRTC infrastructure — only that the file itself isn't stored on an AirBridge-operated server.

## Prototype limitations

This is a one-day build, scoped deliberately:

- **File size limit**: capped at 512 MB, since the receiving browser buffers the whole file in memory before offering it as a download.
- **One file at a time**: no multi-file or folder transfers, and no transfer queue.
- **No TURN relay configured**: connections behind very restrictive NATs/firewalls may fail (see above).
- **No persistence**: refreshing either tab ends the session; there's no transfer history or resumable transfers.
- **No accounts, database, or analytics** — intentionally out of scope for Day 1.
- **Room codes are not authenticated**: anyone with the code (and a live sender) can join the room during the sender's short session window.

## Future improvements

- Optional TURN relay configuration for more reliable connections on restrictive networks
- Resumable transfers if a connection drops mid-file
- Multi-file / folder transfer support
- Transfer history (client-side only, no server persistence)
- QR code as an alternative to typing the room code

## Author

Built by **Devanshu** as Day 1 of the **60 Days Fires** challenge — 60 one-day projects.

GitHub: _add your repository link here_
