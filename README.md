# KIMUN 2026 - Application Portal

A complete two-sided application and screening portal for Kalinga International Model United Nations 2026, featuring AI-powered form suggestions, intelligent application evaluation, and an advanced admin dashboard.

## Features

### For Candidates
- **Google Sign-In**: Easy authentication via Google
- **AI-Powered Form Suggestions**: Get intelligent suggestions for application form fields powered by Gemini API
- **Application Tracking**: Track your application status in real-time
- **Interview Scheduling**: Once moved to interview phase, view available slots and book your slot via Cal.com
- **Direct Messaging**: Receive messages from admin team with feedback and updates
- **Admin Feedback**: View AI evaluation scores and admin notes on your application

### For Admins
- **Smart Filtering**: Filter applications by status, committee, and search by name/email/school
- **AI Evaluation**: Automatically evaluate applications using Gemini AI to get:
  - Score (1-100)
  - Assessment summary
  - Key strengths
  - Areas for improvement
- **Application Management**: 
  - Change application status (Pending → Under Review → Interview Phase/Approved/Rejected)
  - Approving a candidate automatically moves them to Interview Phase
  - Add admin notes
  - View full application details
- **Bulk Actions**: Approve or reject multiple applications at once
- **CSV Export**: Export filtered applications to CSV for further analysis
- **Direct Messaging**: Send messages to candidates with feedback and decisions
- **Real-Time Updates**: See application updates instantly as they come in

## Tech Stack

- **Frontend**: Next.js 16 with React 19.2
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth with Google Sign-In
- **AI**: Google Gemini API
- **UI Components**: shadcn/ui with Radix UI
- **Form Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4
- **Notifications**: Sonner Toast

## Getting Started

### Prerequisites

1. Node.js 18+ and pnpm
2. Firebase project with:
   - Authentication (Google Sign-In enabled)
   - Realtime Database enabled
3. Google Cloud project with Gemini API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kimun-portal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file with your Firebase, Gemini, and Cal.com credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   GEMINI_API_KEY=your_gemini_api_key

   # Cal.com interview scheduling
   CAL_API_KEY=your_cal_api_key
   CAL_EVENT_TYPE_ID=123456
   # or use slug instead of eventTypeId:
   # CAL_EVENT_TYPE_SLUG=kimun-interview
   CAL_USERNAME=your_cal_username
   CAL_API_BASE_URL=https://api.cal.com/v2
   # Optional route overrides
   # CAL_SLOTS_ENDPOINT=https://api.cal.com/v2/slots
   # CAL_BOOK_ENDPOINT=https://api.cal.com/v2/bookings
   CAL_BOOKING_PAGE_URL=https://cal.com/your-handle/kimun-interview
   ```

4. **Setup Firebase Realtime Database**

   In Firebase Console, create this structure:
   ```
   applications/
   admins/
   messages/
   ```

5. **Add Admin Users**

   For each admin user, create an entry in the `admins` table:
   ```
   admins/
     {USER_UID}: true
   ```

6. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── evaluate/          # AI evaluation API endpoint
│   ├── admin/
│   │   └── page.tsx           # Admin dashboard
│   ├── dashboard/
│   │   └── page.tsx           # Candidate dashboard
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── page.tsx               # Landing page
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── candidate-form.tsx     # Application form with AI suggestions
│   ├── messaging-dialog.tsx   # Direct messaging component
│   └── icons/                 # Custom icons
├── context/
│   └── auth-context.tsx       # Authentication context
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   ├── ai-service.ts          # Gemini AI integration
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## Key Components

### Candidate Application Form
- Dynamic form with validation
- AI suggestions for each field
- Real-time form state management
- Automatic Firebase submission

### Admin Dashboard
- Real-time application list with live updates
- Advanced filtering and search
- AI evaluation with one-click evaluation
- Bulk status management
- CSV export functionality
- Direct messaging with candidates

### Messaging System
- Real-time message sync with Firebase
- Timestamp tracking
- User identification
- Scroll area for message history

## Database Schema

### Applications Collection
```typescript
{
  uid: string                                    // Candidate UID
  displayName: string                            // Candidate name
  email: string                                  // Candidate email
  photoURL: string                               // Google profile photo
  fullName: string                               // Full name
  school: string                                 // School name
  committee: string                              // Committee preference
  motivation: string                             // Motivation text
  submittedAt: ISO timestamp                    // Submission time
  status: "pending" | "under_review" | "interview_phase" | "approved" | "rejected"
  interview?: {
    status: "pending" | "scheduled" | "cancelled"
    phaseStartedAt: ISO timestamp
    slotStart?: ISO timestamp
    slotEnd?: ISO timestamp
    timeZone?: string
    calBookingId?: string
    calBookingUrl?: string
    bookedAt?: ISO timestamp
  }
  aiScore: number                                // AI evaluation score (1-100)
  adminNotes: string                             // Admin feedback notes
}
```

### Admins Collection
```typescript
{
  {USER_UID}: true                              // Admin user ID (key)
}
```

### Messages Collection
```typescript
{
  {APPLICATION_UID}:
    {MESSAGE_ID}:
      sender: string                            // User UID of sender
      senderName: string                        // Display name
      text: string                              // Message content
      timestamp: ISO timestamp                  // Send time
}
```

## Firebase Security Rules

```json
{
  "rules": {
    "applications": {
      "$uid": {
        ".read": "auth.uid === $uid || root.child('admins').child(auth.uid).exists()",
        ".write": "auth.uid === $uid"
      }
    },
    "admins": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": false
    },
    "messages": {
      "$app_uid": {
        ".read": "root.child('applications').child($app_uid).child('uid').val() === auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "root.child('applications').child($app_uid).child('uid').val() === auth.uid || root.child('admins').child(auth.uid).exists()"
      }
    }
  }
}
```

## AI Features

### Form Suggestions (Candidate)
When candidates are filling the form, they can click the sparkle icon to get AI-powered suggestions for:
- Full name format
- School name variations
- Motivation improvements

The AI uses the Gemini API to understand context and provide helpful suggestions.

### Application Evaluation (Admin)
Admins can evaluate applications using the "Evaluate" button. The AI will:
- Analyze the application
- Generate a score (1-100)
- Provide assessment summary
- List key strengths
- Identify improvement areas

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings
   - Deploy

3. **Set up Firebase Rules**
   - Go to Firebase Console → Realtime Database → Rules
   - Update rules as shown in Database Schema section
   - Publish

## Troubleshooting

### "Not found" on /admin
- Ensure user's UID is added to the `admins` table in Firebase

### AI suggestions not working
- Verify `GEMINI_API_KEY` is set correctly
- Check Google Cloud Console for API access
- Verify Generative AI API is enabled

### Applications not saving
- Check Firebase Realtime Database is enabled
- Verify database rules allow writes
- Check network tab in browser dev tools

### Messages not appearing
- Check Firebase security rules for messages collection
- Verify both users have proper read/write access
- Check browser console for errors

## Contributing

To contribute to this project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check SETUP.md for detailed setup instructions
- Review the code comments
- Check browser console for error messages
- Verify all environment variables are set

## Future Enhancements

- Email notifications for application status
- PDF export of applications
- Interview scheduling system
- Application analytics dashboard
- Document upload for candidates
- Custom evaluation criteria
- Multi-language support
