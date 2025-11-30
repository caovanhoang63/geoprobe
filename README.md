> [!WARNING]
> **AI-Generated Project:** This application was developed 100% via "vibe coding" using [Claude Code](https://www.claude.com/product/claude-code) and [ClaudeKit](https://claudekit.cc/).

# 🌍 GeoProbe

> **A self-hosted, multi-location uptime monitor built with SvelteKit, SQLite, and the Globalping Network.**



## 📖 Introduction

**GeoProbe** is an advanced uptime monitoring solution that solves the "location bias" problem. Unlike traditional monitors that check your website from a single server, GeoProbe leverages the [Globalping REST API](https://globalping.io/) to dispatch probes to residential and datacenter networks worldwide.

It combines the performance of **SvelteKit (SSR)** with the simplicity of **SQLite**, giving you a robust, self-hosted monitoring tool without the complexity of microservices.

## ✨ Key Features

* **🌐 Multi-Location Monitoring:** Check HTTP/HTTPS latency from specific regions (e.g., "Check `google.com` from Vietnam, Germany, and USA").
* **⏰ Customizable Intervals:** Configure check frequencies per monitor (e.g., critical services every 2 minutes, blogs every hour).
* **🚨 Multi-Channel Alerting:** Built-in integration for **Discord Webhooks**. Receive instant notifications when a site goes down or latency spikes.
* **🏠 Residential Network Testing:** Detect if your site is blocked or throttled by specific ISPs (Last-mile monitoring).
* **📂 Portable Database:** Powered by **Better-SQLite3** and **Drizzle ORM** for a lightweight, type-safe, and zero-config database experience.
* **📊 Historical Data:** Visualize latency trends and uptime percentage over time.

## 🛠️ Tech Stack
* **Package manager**: pnpm
* **Framework:** [SvelteKit](https://kit.svelte.dev/) (Node.js Adapter)
* **Language:** TypeScript
* **Database:** SQLite (via `better-sqlite3`)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Scheduler:** `node-cron`
* **External API:** [Globalping REST API](https://globalping.io/docs/api.globalping.io)
* **Styling:** TailwindCSS & Daisy UI

## 📐 Architecture & Technical Details

### 1\. The Asynchronous Polling Engine

GeoProbe handles the asynchronous nature of the Globalping API efficiently to prevent rate-limiting while ensuring data accuracy:

1.  **Initiation (`POST /v1/measurements`):** The system requests a check and receives a `measurementId`.
2.  **Smart Polling (`GET /v1/measurements/{id}`):** Instead of spamming the API, GeoProbe implements a polling loop with a **1-second delay** backoff strategy.
3.  **Completion:** The loop continues until the status returns `finished`, at which point data is parsed and stored.

### 2\. Background Scheduler

To ensure reliable monitoring without external dependencies, GeoProbe uses `node-cron` initialized within SvelteKit's `hooks.server.ts`.

> **⚠️ Important Deployment Note:**
> Since this architecture relies on a persistent background process for the scheduler (`node-cron`), **GeoProbe cannot be deployed on Serverless platforms** like Vercel or Netlify (Serverless functions "sleep" when idle).
>
> You must deploy this on a **VPS**, **Docker**, or any platform that supports long-running Node.js processes (e.g., Railway, Fly.io, DigitalOcean).

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Docker (Optional but recommended)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/geoprobe.git
    cd geoprobe
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    *Inside `.env`:*

    ```env
    DATABASE_URL=file:./data.db
    DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
    ```

4.  **Initialize Database**
    Push the schema using Drizzle Kit:

    ```bash
    npm run db:push
    ```

5.  **Run Development Server**

    ```bash
    npm run dev
    ```

## 📦 Deployment (Docker)

The easiest way to run GeoProbe is via Docker. This ensures the background workers stay alive.

```yaml
# docker-compose.yml
version: '3'
services:
  geoprobe:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/geoprobe.db
      - ORIGIN=http://localhost:3000
    command: sh -c "npm install && npm run build && node build"
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## 🗺️ Roadmap

- [ ]  Add Telegram & Slack integration.
- [ ]  Add "Status Page" mode (Public view vs Admin view).
- [ ]  Support TCP/Ping/DNS checks.
- [ ]  Compare latency between different ISPs (e.g., VNPT vs Viettel).

## 🤝 Contributing

Contributions are welcome\! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request


## 💡 Inspiration & Credits

This project is heavily inspired by the amazing **[Uptime Kuma](https://github.com/louislam/uptime-kuma)**.

GeoProbe exists primarily to fill a specific niche: **Multi-location monitoring via the Globalping network**.

> **Note:** We are huge fans of Uptime Kuma. If/when Uptime Kuma natively integrates Globalping support, **this repository will be archived/discontinued** in favor of using their robust platform. Until then, GeoProbe serves as a lightweight alternative for "vibe-coded" distributed monitoring.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

-----

*Built with ❤️ using [Globalping](https://globalping.io/).*