# 🚗 Rydex — On-Demand Vehicle Booking & Ride-Hailing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![ZegoCloud](https://img.shields.io/badge/ZegoCloud-Video_KYC-0055FF?style=for-the-badge)](https://www.zegocloud.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Chat_Assistance-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **Rydex** is a modern, full-stack vehicle booking and ride-hailing web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It delivers an end-to-end urban mobility platform connecting riders, verified driver-partners, and platform administrators in real time.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key User Roles & Workflows](#-key-user-roles--workflows)
  - [1. Rider / Customer](#1-rider--customer)
  - [2. Driver / Partner](#2-driver--partner)
  - [3. Platform Administrator](#3-platform-administrator)
- [Real-Time & Smart Features](#-real-time--smart-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Setup Environment Variables](#step-3-setup-environment-variables)
  - [Step 4: Start the Socket Server](#step-4-start-the-socket-server)
  - [Step 5: Run Next.js Client](#step-5-run-nextjs-client)
- [Environment Variables Reference](#-environment-variables-reference)
- [Real-Time Socket Events](#-real-time-socket-events)
- [API Routes Overview](#-api-routes-overview)
- [Security & Trust Highlights](#-security--trust-highlights)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**Rydex** provides a complete ecosystem for urban transport:
- **Instant Vehicle Discovery**: Search nearby vehicles based on live GPS coordinates using MongoDB Geospatial indexing (`2dsphere`) and interactive Leaflet maps.
- **Dual Payment Choices**: Pay securely online via **Razorpay** or choose **Cash on Drop** with in-ride payment reconciliation.
- **Driver Verification & Safety**: Multi-stage driver onboarding, document inspection (RC, DL, Aadhaar), and real-time **Video KYC** sessions via **ZegoCloud**.
- **Real-Time Live Tracking**: Seamless bidirectional WebSocket synchronization powered by **Socket.IO** for live GPS movement, trip state updates, and instant messaging.
- **AI-Powered Communication**: In-ride chat with smart quick-reply suggestions generated contextually using the **Google Gemini API**.

---

## 👥 Key User Roles & Workflows

```
                           ┌───────────────────────────┐
                           │      Rydex Ecosystem      │
                           └─────────────┬─────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│   Customer   │                 │   Partner    │                 │    Admin     │
│   (Rider)    │                 │   (Driver)   │                 │ (Operations) │
└───────┬──────┘                 └───────┬──────┘                 └───────┬──────┘
        │                                │                                │
        ├─ Search & Book Vehicles        ├─ Complete Digital Onboarding   ├─ Review Partner Documents
        ├─ Online/Cash Payment           ├─ Live Video KYC Verification   ├─ Review Vehicle & Pricing
        ├─ Live GPS Driver Tracking      ├─ Accept/Reject Ride Requests   ├─ Monitor Platform KPIs
        ├─ In-Ride Chat (with AI)        ├─ Turn-by-Turn Trip Execution   ├─ Manage Video KYC Audits
        └─ OTP-Protected Rides           └─ Real-Time Earnings Analytics  └─ Commission Reconciliation
```

### 1. Rider / Customer
- **Location-Based Search**: Enter pickup and drop-off destinations with autocomplete geocoding powered by **Geoapify**.
- **Transparent Fare Estimates**: Upfront distance and price calculations across multiple vehicle classes.
- **Flexible Checkout**: Pay digitally with Razorpay cards/UPI/NetBanking or select Cash payment.
- **Live Ride Tracking**: Track driver's live GPS coordinates moving on an interactive **Leaflet** map with route lines and calculated ETAs.
- **Ride Safety**:
  - **Pickup OTP**: Shared with the driver before starting the trip to prevent unauthorized rides.
  - **Drop OTP**: Verified upon arrival to confirm safe drop-off and trip conclusion.
- **In-Ride Messaging**: Direct live chat with the assigned driver, boosted with smart AI quick-replies.

### 2. Driver / Partner
- **Step-by-Step Digital Onboarding**:
  1. Personal & contact profile setup.
  2. Vehicle specifications (Make, model, registration number, category).
  3. Cloudinary document upload (Driving License, Vehicle RC, Aadhaar Card).
  4. Banking & payout details.
- **Live Video KYC**: Connect to a live video room with platform admins via **ZegoCloud UIKit** for identity validation.
- **Live Dispatch Radar**: Receive instant ride requests with audible notifications and a responsive action card to Accept or Reject within a countdown.
- **Interactive Trip Lifecycle**:
  `Accept Request` ➔ `Navigate to Pickup` ➔ `Verify Pickup OTP` ➔ `Trip Started` ➔ `Arrive at Destination` ➔ `Verify Drop OTP / Collect Cash` ➔ `Trip Completed`.
- **Live GPS Broadcaster (`GeoUpdater`)**: Continuously syncs driver coordinates in real time using HTML5 Geolocation and Socket.IO.
- **Earnings Dashboard**: Detailed financial summaries, daily/weekly revenue charts powered by **Recharts**, and breakdown of partner share vs platform commission.

### 3. Platform Administrator
- **Operational KPI Dashboard**: High-level platform metrics including total rides, gross merchandise value (GMV), net platform commissions, active driver count, and customer growth.
- **Document Verification Desk**: Side-by-side preview of driver documents (Aadhaar, Driving License, RC) with single-click Approve or Reject actions (with custom rejection reasons sent to driver).
- **Video KYC Review Desk**: Manage scheduled video verification sessions and record compliance decisions.
- **Vehicle & Pricing Control**: Audit vehicle submissions, monitor dynamic base fares and per-kilometer rates.

---

## ⚡ Real-Time & Smart Features

### 📡 Live WebSocket Synchronization (Socket.IO)
Rydex pairs with a dedicated Node.js/Express socket server to handle ultra-low-latency bidirectional events:
- **Location Updates**: Driver GPS broadcast to customer map in real time.
- **Ride Lifecycle**: Status sync across rider and driver views without page reload.
- **Real-Time In-Ride Chat**: Instant messages delivered to dedicated ride chat rooms (`ride-{bookingId}`).
- **Cash Request Negotiation**: In-app digital handshake for cash collection confirmation.

### 🤖 Gemini AI In-Ride Quick Replies
Integrated with Google Gemini to analyze recent chat history between rider and driver, generating 3–6 concise, context-aware suggestions (e.g., *"I'm at the gate"*, *"Stuck in traffic, 2 mins"*, *"I've arrived"*).

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Client (Next.js 16 App Router)"]
        A[Customer Portal]
        B[Partner Dashboard]
        C[Admin Console]
        D[Redux Toolkit State]
        E[Leaflet Live Maps]
    end

    subgraph Serverless["Next.js Backend (API Routes)"]
        F[/api/auth]
        G[/api/bookings]
        H[/api/partner]
        I[/api/payment]
        J[/api/admin]
        K[/api/chat/ai-suggestions]
    end

    subgraph SocketServer["Dedicated Socket.IO Server"]
        L[Live Room Dispatcher]
        M[GPS Coordinate Relay]
        N[In-Ride Live Chat]
    end

    subgraph CloudServices["Cloud & Third-Party Services"]
        O[(MongoDB Atlas)]
        P[Cloudinary Storage]
        Q[Razorpay Gateway]
        R[ZegoCloud Video KYC]
        S[Google Gemini API]
        T[Geoapify Geocoding]
    end

    Client <-->|HTTP / REST| Serverless
    Client <-->|WebSocket Events| SocketServer
    Serverless <-->|Mongoose ODM| O
    Serverless <-->|Media Uploads| P
    Serverless <-->|Payment Orders & Webhooks| Q
    Serverless <-->|AI Prompts| S
    Client <-->|RTC Video Room| R
    Client <-->|Geocoding / Tiles| T
    SocketServer <-->|Driver Coordinate Persist| O
```

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Hybrid Server/Client Components, Server Actions & REST API routes |
| **UI Library** | [React 19](https://react.dev/) | High-performance reactive UI with modern React compiler support |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | End-to-end type safety across client, server, and data models |
| **Styling & Motion**| [Tailwind CSS v4](https://tailwindcss.com/) & [Motion](https://motion.dev/) | Modern utility-first styling and smooth UI micro-animations |
| **State Management**| [Redux Toolkit](https://redux-toolkit.js.org/) & `react-redux` | Centralized global application state and user role persistence |
| **Database & ODM** | [MongoDB Atlas](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) | Document store with `2dsphere` geospatial indexing |
| **Real-Time Engine**| [Socket.IO Client](https://socket.io/) | Low-latency event streaming connected to Rydex Socket Server |
| **Video Calling** | [ZegoCloud UIKit Prebuilt](https://www.zegocloud.com/) | Real-time video conferencing for Partner Video KYC audits |
| **Authentication** | [NextAuth.js v5 (Auth.js)](https://authjs.dev/) | Google OAuth 2.0, Credentials with bcryptjs, Nodemailer OTP |
| **Payments** | [Razorpay](https://razorpay.com/) | Online payment order creation, checkout modal & signature verification |
| **Maps & Geo** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/) & [Geoapify](https://www.geoapify.com/) | Interactive map visualization, routing, marker animation & geocoding |
| **Cloud Storage** | [Cloudinary](https://cloudinary.com/) | Secure cloud asset storage for driver licenses, vehicle RC & IDs |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) | Contextual conversation analysis for smart in-ride suggestions |
| **Charts** | [Recharts](https://recharts.org/) | Visual analytics for driver revenue and admin financial tracking |
| **Icons** | [Lucide React](https://lucide.dev/) & [Remix Icons](https://remixicon.com/) | Comprehensive, modern iconography |

---

## 📁 Project Directory Structure

```text
rydex/
├── public/                     # Static assets and icons
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin console (Reviews, Pricing, Video KYC)
│   │   ├── api/                # Backend API Routes
│   │   │   ├── admin/          # Admin operations & review endpoints
│   │   │   ├── auth/           # NextAuth & Signup/OTP endpoints
│   │   │   ├── bookings/       # Booking creation, active ride, reviews
│   │   │   ├── chat/           # In-ride chat & Gemini AI suggestions
│   │   │   ├── partner/        # Partner onboarding, OTP verification & earnings
│   │   │   ├── payment/        # Razorpay & Cash handling endpoints
│   │   │   ├── user/           # User profile & ride history
│   │   │   └── vehicles/       # Nearby vehicle discovery queries
│   │   ├── customer/           # Customer booking, active ride & search pages
│   │   ├── partner/            # Driver onboarding & booking management
│   │   ├── video-kyc/          # ZegoCloud Video KYC room ([roomId])
│   │   ├── globals.css         # Global Tailwind CSS styles
│   │   ├── layout.tsx          # Root HTML layout with providers
│   │   └── page.tsx            # Dynamic entry point routing by user role
│   ├── components/             # Reusable UI Components
│   │   ├── AdminDashboard.tsx  # Admin metrics & review tabs
│   │   ├── LiveRideMap.tsx     # Real-time Leaflet map for ride tracking
│   │   ├── PartnerDashboard.tsx# Driver dashboard with live ride broadcasts
│   │   ├── RideChat.tsx        # Socket chat drawer with AI suggestions
│   │   ├── Nav.tsx             # Responsive role-aware navigation
│   │   ├── AuthModel.tsx       # Auth modal (Email OTP & Google Login)
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities & singleton clients
│   │   ├── cloudinary.ts       # Cloudinary upload configuration
│   │   ├── db.ts               # Mongoose database connection
│   │   ├── razorpay.ts         # Razorpay client instance
│   │   ├── sendMail.ts         # Nodemailer OTP email dispatcher
│   │   └── socket.ts           # Socket.IO client manager
│   ├── model/                  # Mongoose Database Schemas
│   │   ├── booking.model.ts    # Ride booking schema & status enum
│   │   ├── chat.model.ts       # In-ride chat message schema
│   │   ├── partnerBank.model.ts# Partner payout & bank account details
│   │   ├── partnerDocs.model.ts# Driver documents (DL, RC, Aadhaar)
│   │   ├── user.model.ts       # User, Partner & Admin profile schema
│   │   └── vehicle.model.ts    # Vehicle specifications & rates schema
│   ├── Toolkit/                # Redux Toolkit store & userSlice
│   ├── auth.ts                 # NextAuth v5 configuration & callbacks
│   └── proxy.ts                # Route handlers / proxy helpers
├── .env                        # Environment variables (see reference below)
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** `>= 18.17.0` (LTS recommended)
- **npm**, **pnpm**, **yarn**, or **bun**
- A running **MongoDB** instance (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Running instance of **Rydex Socket Server** (`socketServer/`)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/rydex.git
cd rydex
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

### Step 3: Setup Environment Variables
Create a `.env.local` or `.env` file in the `rydex/` root directory:

```env
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/rydex"

# NextAuth Configuration
AUTH_SECRET="your-32-character-auth-secret"

# Google OAuth (Optional / For Social Login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# SMTP Email Configuration (For Email OTP verification)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# Cloudinary (Document & Vehicle Image Uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# ZegoCloud Video KYC
NEXT_PUBLIC_ZEGO_APP_ID=123456789
NEXT_PUBLIC_ZEGO_SERVER_SECRET="your-zego-server-secret"

# Real-Time Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:8000"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"

# Geocoding & Maps
NEXT_PUBLIC_GEOAPIFY_KEY="your-geoapify-api-key"

# Google Gemini AI (Smart Chat Replies)
GOOGLE_GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/interactions?key=YOUR_GEMINI_KEY"
```

### Step 4: Start the Socket Server
In a separate terminal tab, navigate to the `socketServer` directory and start the socket engine:

```bash
cd ../socketServer
npm install
npm run dev
# Socket server starts on port 8000 (or configured PORT)
```

### Step 5: Run Next.js Client
Return to the `rydex/` directory and launch the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to explore Rydex!

---

## 🔑 Environment Variables Reference

| Variable Name | Required | Description | Example / Format |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb+srv://user:pass@host/db` |
| `AUTH_SECRET` | **Yes** | Encryption key used by NextAuth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth App Client ID | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth App Secret Key | `GOCSPX-...` |
| `SMTP_USER` | **Yes** | Sender email address for OTPs | `support@rydex.com` |
| `SMTP_PASS` | **Yes** | SMTP App Password | App password from Gmail/SendGrid |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary Cloud name | `drx6...` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API Key | `9839...` |
| `CLOUDINARY_API_SECRET`| **Yes** | Cloudinary API Secret | `Fz0v...` |
| `NEXT_PUBLIC_ZEGO_APP_ID` | **Yes** | ZegoCloud App ID for Video KYC | Number (e.g., `54796158`) |
| `NEXT_PUBLIC_ZEGO_SERVER_SECRET` | **Yes** | ZegoCloud Server Secret | Hex string |
| `NEXT_PUBLIC_SOCKET_URL` | **Yes** | URL of the running Socket server | `http://localhost:8000` |
| `RAZORPAY_KEY_ID` | **Yes** | Razorpay Merchant Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | **Yes** | Razorpay Secret Key | `fS4K...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Yes** | Public Razorpay key for client modal | `rzp_test_...` |
| `NEXT_PUBLIC_GEOAPIFY_KEY` | **Yes** | Geoapify Geocoding API key | Hex string |
| `GOOGLE_GEMINI_API_URL`| Optional | Endpoint for Gemini AI chat suggestions | `https://generativelanguage...` |

---

## 📡 Real-Time Socket Events

| Event | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `identity` | Client ➔ Server | `userId` | Registers client socket ID and sets user status to online |
| `update_coordinates` | Client ➔ Server | `{ userId, lon, lat }` | Broadcasts driver's GPS location to the server |
| `join-ride` | Client ➔ Server | `bookingId` | Joins private socket room `ride-{bookingId}` |
| `driver-location-update` | Partner ➔ Server | `{ bookingId, status, latitude, longitude }` | Emits live GPS coordinate update to ride room |
| `driver-location` | Server ➔ Customer | `{ latitude, longitude, bStatus }` | Updates vehicle position marker on customer map |
| `ride-confirmed` | Server ➔ Room | — | Notifies that ride has been accepted and confirmed |
| `new-message` | Client ➔ Server | `{ bookingId, sender, msg, time }` | Broadcasts chat message to both parties in the ride room |
| `cash-request` | Driver ➔ Server | `{ bookingId }` | Prompts rider to pay cash at destination |
| `cash-received` | Driver ➔ Server | `{ bookingId }` | Confirms driver received cash, concluding payment |
| `cash-declined` | Driver ➔ Server | `{ bookingId }` | Notifies customer if cash was not received or disputed |

---

## 🔌 API Routes Overview

```text
/api/
├── auth/
│   ├── [...nextauth]             # NextAuth authentication handlers
│   ├── signup                    # Email + password user registration
│   └── verify-email              # Email OTP verification
├── bookings/
│   ├── create                    # Create ride booking with initial fare calculation
│   ├── active-ride               # Fetch currently active booking for current session
│   ├── review                    # Submit customer rating and review
│   └── [id]/cancel-ride          # Cancel pending or confirmed ride
├── partner/
│   ├── onboarding/               # Multi-step onboarding (vehicle, docs, bank, pricing)
│   ├── bookings/pending-requests # Fetch incoming ride broadcast requests
│   ├── bookings/[id]/accept      # Driver accepts ride request
│   ├── bookings/[id]/reject      # Driver rejects ride request
│   ├── bookings/otp/pickup/verify# Verify 4-digit pickup OTP to begin trip
│   ├── bookings/otp/drop/verify  # Verify 4-digit drop OTP to end trip
│   └── earning                   # Partner revenue and trip analytics
├── payment/
│   ├── create                    # Generate Razorpay payment order
│   ├── verify                    # Validate Razorpay checkout signature
│   └── [id]/cash-ride            # Initiate cash payment workflow
├── admin/
│   ├── dashboard                 # Aggregate platform metrics and KPIs
│   ├── reviews/partner/[id]      # Document verification & review decisions
│   ├── reviews/vehicle/[id]      # Vehicle audit & rate verification
│   └── videoKyc/[id]             # Video KYC audit status & room management
├── chat/
│   ├── send                      # Persist and send in-ride chat message
│   ├── get-chat                  # Retrieve ride chat conversation history
│   └── ai-suggestions            # Generate context-aware suggestions via Gemini AI
└── vehicles/
    └── near-by                   # Geospatial query for available vehicles near location
```

---

## 🔒 Security & Trust Highlights

1. **Two-Factor Ride Validation**:
   - **Pickup OTP**: Prevents wrong riders from getting into vehicles; trip can only be started when the driver enters the customer's secure OTP.
   - **Drop OTP**: Guarantees trip completion and prevents premature closing of rides.
2. **Video KYC Compliance**: Real-time face-to-face video verification ensures only genuine drivers with valid documentation operate on the platform.
3. **Role-Based Access Control**: Strict route & API security ensuring customers cannot access partner dashboards or admin consoles.
4. **Cryptographic Payment Integrity**: All Razorpay payment captures are verified on the server using HMAC SHA256 signatures before confirming booking status.
5. **Private In-Ride Rooms**: Chat messages and live GPS coordinates are restricted strictly to the participants of that specific `ride-{id}` room.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for next-generation urban mobility.
</p>
