# NCC Robotics Workshop 2025

A full-stack event management website for the NCC Robotics Workshop 2025, built with Next.js and Appwrite.

## 🚀 Features

### Core Pages
- **Home Page** - Hero section, event timeline, and registration CTA
- **Registration** - Multi-step form with file uploads and payment integration
- **Login/Auth** - Email/password authentication with Appwrite
- **User Dashboard** - Profile management, registration status, and downloadable PDFs
- **Admin Panel** - User management, announcements, and resource sharing

### Key Functionality
- 🔐 **Authentication** - Secure login/register with Appwrite
- 📝 **Multi-step Registration** - Personal info, event selection, document uploads
- 👤 **User Dashboard** - Profile editing, registration status, PDF downloads
- 🛠️ **Admin Panel** - User management, announcements, resource uploads
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI** - Framer Motion animations and futuristic design
- 📄 **PDF Generation** - Registration confirmations and admin reports
- 📧 **Email Notifications** - Registration confirmations and announcements

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: jsPDF
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roboticswork
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local` and update with your Appwrite credentials
   - Create an Appwrite project at [cloud.appwrite.io](https://cloud.appwrite.io)
   - Set up the required databases and collections (see Appwrite Setup below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Appwrite Setup

### 1. Create Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project named "NCC Robotics 2025"
3. Copy the Project ID to your `.env.local`

### 2. Database Setup
Create a database named "ncc-robotics-db" with the following collections:

#### Users Collection
```json
{
  "name": "users",
  "attributes": [
    { "key": "name", "type": "string", "size": 255, "required": true },
    { "key": "email", "type": "string", "size": 255, "required": true },
    { "key": "phone", "type": "string", "size": 20, "required": false },
    { "key": "institution", "type": "string", "size": 255, "required": false },
    { "key": "studentId", "type": "string", "size": 100, "required": false },
    { "key": "role", "type": "string", "size": 20, "required": true, "default": "user" },
    { "key": "isVerified", "type": "boolean", "required": true, "default": false }
  ]
}
```

#### Registrations Collection
```json
{
  "name": "registrations",
  "attributes": [
    { "key": "userId", "type": "string", "size": 255, "required": true },
    { "key": "eventType", "type": "string", "size": 50, "required": true },
    { "key": "personalInfo", "type": "string", "size": 2000, "required": true },
    { "key": "documents", "type": "string", "size": 1000, "required": true },
    { "key": "status", "type": "string", "size": 30, "required": true, "default": "pending_verification" },
    { "key": "paymentStatus", "type": "string", "size": 30, "required": true, "default": "verification_pending" },
    { "key": "paymentScreenshotId", "type": "string", "size": 255, "required": false },
    { "key": "registrationId", "type": "string", "size": 100, "required": true },
    { "key": "dietaryRestrictions", "type": "string", "size": 500, "required": false },
    { "key": "tshirtSize", "type": "string", "size": 10, "required": false },
    { "key": "submittedAt", "type": "string", "size": 50, "required": false },
    { "key": "registrationFee", "type": "integer", "required": false }
  ]
}
```

#### Announcements Collection
```json
{
  "name": "announcements",
  "attributes": [
    { "key": "title", "type": "string", "size": 255, "required": true },
    { "key": "content", "type": "string", "size": 5000, "required": true },
    { "key": "type", "type": "string", "size": 20, "required": true },
    { "key": "authorId", "type": "string", "size": 255, "required": true }
  ]
}
```

#### Resources Collection
```json
{
  "name": "resources",
  "attributes": [
    { "key": "title", "type": "string", "size": 255, "required": true },
    { "key": "description", "type": "string", "size": 1000, "required": true },
    { "key": "type", "type": "string", "size": 20, "required": true },
    { "key": "fileId", "type": "string", "size": 255, "required": false },
    { "key": "url", "type": "string", "size": 500, "required": false },
    { "key": "authorId", "type": "string", "size": 255, "required": true }
  ]
}
```

### 3. Storage Setup
Create the following storage buckets:
- **documents** - For ID cards and academic proofs
- **resources** - For admin-uploaded resources
- **avatars** - For user profile pictures

### 4. Authentication Setup
1. Enable Email/Password authentication
2. Configure email templates for verification and password reset
3. Set up OAuth providers (Google, Facebook) if needed

## 📁 Project Structure

```
roboticswork/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin panel
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── register/
│   │   └── page.tsx          # Registration page
│   ├── user/
│   │   └── page.tsx          # User dashboard
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── Footer.tsx            # Footer component
│   ├── Header.tsx            # Header component
│   └── RobotSVG.tsx          # Robot animation
├── lib/
│   ├── context/
│   │   └── AuthContext.tsx   # Authentication context
│   └── appwrite.ts           # Appwrite configuration
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # This file
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Gradient from blue-50 to purple-50

### Typography
- **Font Family**: Inter (system font)
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable sans-serif

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with validation states
- **Animations**: Smooth transitions with Framer Motion

## 🔐 Demo Accounts

### Admin Account
- **Email**: admin@nccrobotics.com
- **Password**: admin123
- **Access**: Full admin panel access

### User Account
- **Email**: user@example.com
- **Password**: user123
- **Access**: User dashboard only

## 📅 Event Timeline

- **22 June 2025** - Website Launch
- **24 June 2025** - Registration Opens
- **26 June 2025** - Soccerbot Competition (9:00AM–10:00AM)
- **30 June 2025** - Main Robotics Workshop (10:00AM–4:00PM)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Configure your web server to serve the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Email**: support@nccrobotics.com
- **Website**: [nccrobotics.com](https://nccrobotics.com)
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Appwrite** - Backend-as-a-Service
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide** - Icon library

---

**Built with ❤️ for NCC Robotics Workshop 2025**