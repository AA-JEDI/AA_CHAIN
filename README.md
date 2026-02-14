# FreelanceDAO - Web3 Freelance Agreement Platform

A modern, Web3-based freelance agreement platform with escrow functionality built with Next.js 14, React, and Tailwind CSS.

## Features

- 🔐 **Wallet Authentication** - Connect with MetaMask, WalletConnect, or Coinbase
- 📝 **Agreement Management** - Create, accept, and manage freelance agreements
- 💰 **Escrow System** - Secure funds in escrow until work is completed
- ✏️ **Amendments** - Propose and approve changes to agreements
- ⚖️ **Dispute Resolution** - Raise disputes and freeze funds when needed
- 🔔 **Real-time Notifications** - Stay updated on all agreement activities
- 🌙 **Dark/Light Mode** - Full theme support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd freelance-escrow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard pages with shared layout
│   │   ├── home/           # Home page with user search
│   │   ├── projects/       # Projects list and detail
│   │   ├── wallet/         # Wallet management
│   │   └── notifications/  # Notifications list
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/
│   ├── ui/                 # Shared UI components
│   ├── layouts/            # Layout components
│   ├── agreements/         # Agreement-related components
│   ├── escrow/             # Escrow components
│   ├── amendments/         # Amendment components
│   ├── users/              # User search/display components
│   ├── notifications/      # Notification components
│   └── modals/             # Modal dialogs
├── services/               # Placeholder API services
├── state/                  # Zustand stores
├── mock/                   # Mock data
├── types/                  # TypeScript types
└── lib/                    # Utilities and constants
```

## Key Features Implementation

### Agreement Lifecycle

1. **Proposal** - User searches for another user and proposes an agreement
2. **Acceptance** - Recipient reviews and accepts/rejects the proposal
3. **Active** - Work begins, escrow is funded
4. **Amendments** - Either party can propose changes (requires dual approval)
5. **Completion** - Both parties mark as complete, escrow releases
6. **Dispute** - Either party can raise a dispute, freezing escrow

### Role System

- **Customer**: Can pay, initiates escrow funding
- **Freelancer**: Receives payment upon completion

### Escrow States

- `unfunded` - No funds deposited
- `pending` - Transaction in progress
- `funded` - Funds secured
- `frozen` - Dispute raised
- `released` - Funds released to freelancer

## Mock Data

The app includes comprehensive mock data for demonstration:

- 5 sample users
- 5 agreements in various states
- Amendment history
- Notification examples
- Transaction history

## Customization

### Theme

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: 262.1 83.3% 57.8%;
  --background: 224 71% 4%;
  /* ... */
}
```

### Services

Replace placeholder services in `src/services/` with real blockchain integrations:

- `agreementService.ts` - Smart contract interactions
- `escrowService.ts` - Escrow management
- `walletService.ts` - Wallet connection

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

---

Built for Stack Too Deep Hackathon 🚀
