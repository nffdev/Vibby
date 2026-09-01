# Vibby

Short-form video app - trending feed, likes, comments, follows.

**Stack:** MERN - React + Vite (front) - Node/Express + MongoDB (back) - [Mux](https://mux.com) (video) - JWT (auth).

## Requirements

- Node.js 18+
- A MongoDB database
- A Mux account (token + webhook)

## Setup

```bash
# Back
cd Back
npm install
cp .env.example .env   # then fill in the values

# Front
cd ../Front
npm install
```

### Environment variables (`Back/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (e.g. `8080`) |
| `MONGO_URL` | MongoDB connection string |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | Mux API credentials |
| `MUX_WEBHOOK_SECRET` | Mux webhook signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `JWT_SECRET` | Token signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `30d`) |

Front config (API URL, Google client ID) lives in `Front/src/config.json`.

## Running in development

```bash
# Back (port from .env)
cd Back && node index.js

# Front (port 5173)
cd Front && npm run dev
```

## Mux webhook

Mux notifies the API when a video is ready. The route is **`POST /v1/mux/webhook`** on the back.

Locally, expose the API through a tunnel (Mux can't reach `localhost`):

```bash
ngrok http 8080
```

Then set the webhook URL in the Mux dashboard:

```
https://<your-tunnel>.ngrok-free.app/v1/mux/webhook
```

Copy the signing secret Mux gives you into `MUX_WEBHOOK_SECRET`.

## Production build

```bash
cd Front && npm run build
```

## License

See [LICENSE](LICENSE).
