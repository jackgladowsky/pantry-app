# Deploying Pantry App

## Quick Start (Recommended)

```bash
# Run in background
./deploy.sh bg

# Or foreground
./deploy.sh prod

# Stop
./deploy.sh stop
```

App runs at `http://localhost:3000`

## Docker

```bash
# Build and run
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f
```

## Systemd Service (Auto-start on boot)

```bash
# Install service
cp pantry-app.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable pantry-app
systemctl --user start pantry-app

# Check status
systemctl --user status pantry-app

# View logs
journalctl --user -u pantry-app -f
```

## Environment

Copy `.env.example` to `.env.local` and fill in:
- `CONVEX_DEPLOYMENT` - Your Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
- `OPENROUTER_API_KEY` - For AI features (optional)
