# Brandr - AI Social Media Content Platform

A comprehensive AI-powered platform for creating, scheduling, and optimizing social media content with brand consistency.

---

## 📊 Project Status Overview

| Phase | Feature | Status | Completion |
|-------|---------|--------|------------|
| 1 | Authentication & Onboarding | ✅ Complete | 100% |
| 2 | Brand Studio | ✅ Complete | 100% |
| 3 | AI Content Creation | 🔄 In Progress | 75% |
| 4 | Social Media Integrations | ❌ Not Started | 0% |
| 5 | Scheduling & Calendar | 🔄 Partial | 40% |
| 6 | Content Library | ✅ Complete | 100% |
| 7 | Analytics | 🔄 Partial | 50% |
| 8 | Automation | 🔄 Partial | 20% |

**Overall Progress: ~60%**

---

## ✅ What's Built (Ready for Use)

### Phase 1: Authentication & User Management
- [x] Email/password signup and login with Supabase Auth
- [x] 7-day free trial system with automatic tracking
- [x] Subscription status in user profile
- [x] Protected routes requiring authentication
- [x] User profiles with automatic creation on signup
- [x] Session persistence across page reloads

### Phase 2: Brand Studio
- [x] Create and manage multiple brands
- [x] Brand name, website URL configuration
- [x] Social media handles (Instagram, Twitter, LinkedIn, Facebook)
- [x] Brand voice selection (up to 3 characteristics)
- [x] Brand mission/essence configuration
- [x] Brand colors (primary/secondary)
- [x] **Brand Guidelines Upload** - PDF, Word, Text, Markdown support
- [x] **AI Parsing of Guidelines** - Extracts brand rules automatically via Gemini 2.5 Flash
- [x] Storage bucket for secure document storage

### Phase 3: AI Content Creation (Partial)
- [x] **4-Step Creation Workflow UI**: Brief → Generate → Craft → Finalize
- [x] Platform selection (Instagram, Twitter/X, LinkedIn, Facebook)
- [x] Creative direction input with multi-line text
- [x] **AI Content Generation** - Using Gemini 3 Flash via Lovable AI Gateway
- [x] Platform-specific content optimization (character limits, tone, hashtags)
- [x] Multiple variations generated per platform
- [x] **Image Gallery** - Upload and manage images for posts
- [x] **AI Image Generation** - Generate images from prompts using Gemini 2.5 Flash Image
- [x] **Craft Step** - Rich editing with:
  - Platform tabs for switching between variations
  - Character count with visual progress bar
  - Emoji quick-picker
  - Line break formatting tool
  - CTA insertion helper
  - Hashtag management (add/remove)
  - Platform-specific tips
  - Preview mode toggle
- [x] Regenerate individual platform content
- [x] Copy to clipboard functionality
- [ ] **Finalize Step** - Save to library & schedule (placeholder only)

### Phase 5: Content Calendar (Partial)
- [x] Monthly calendar view with navigation
- [x] Date selection showing scheduled posts
- [x] Visual indicators for days with scheduled content
- [x] Platform color coding
- [ ] Drag-and-drop scheduling
- [ ] Time slot management
- [ ] Bulk scheduling

### Phase 6: Content Library
- [x] View all generated posts
- [x] Search by title/content
- [x] Filter by status (draft, scheduled, published)
- [x] Filter by platform
- [x] Delete posts
- [x] Post cards with metadata (date, platforms, status)
- [ ] Edit existing posts
- [ ] Duplicate posts
- [ ] Version history

### Phase 7: Analytics (Partial)
- [x] Overview stats (total, drafts, scheduled, published)
- [x] Platform distribution breakdown
- [x] Basic counting from content library
- [ ] Time-series activity charts
- [ ] Content performance tracking
- [ ] AI-powered recommendations
- [ ] Weekly/monthly reports

### Phase 8: Automation (Placeholder)
- [x] UI for automation workflows
- [x] Template cards (Motivation Monday, Weekly Tips, Friday Recap)
- [x] Stats placeholders (active workflows, posts generated)
- [ ] Actually functional automation
- [ ] Custom workflow creation
- [ ] Trigger-based content generation
- [ ] Scheduled recurring posts

---

## 🚧 What's Missing to Launch

### Critical (Launch Blockers)

#### 1. Finalize Step - Save Posts to Library
**Priority: HIGH** | Estimated: 2-3 hours
- Connect "Publish Now" button to save post to `content_library` table
- Include all variations, hashtags, and media URLs
- Set initial status as 'draft' or 'published'
- Redirect to Content Library after saving

#### 2. Brand Selection in Content Creation
**Priority: HIGH** | Estimated: 1-2 hours
- Add brand dropdown to Brief step
- Pass brand ID and brand context (voice, guidelines) to AI generation
- AI should use brand voice/mission/guidelines for personalized content

#### 3. Scheduling Functionality
**Priority: HIGH** | Estimated: 3-4 hours
- Date/time picker in Finalize step
- Save `scheduled_at` timestamp to database
- Update content status to 'scheduled'
- Display scheduled posts correctly in calendar

### Important (Core Experience)

#### 4. Edit Existing Posts
**Priority: MEDIUM** | Estimated: 2-3 hours
- Click post in library to open editor
- Pre-populate form with existing content
- Save updates back to database

#### 5. Social Media Platform Connections
**Priority: MEDIUM** | Estimated: 8-12 hours per platform
- OAuth integration with Instagram, Twitter, LinkedIn, Facebook
- Store access tokens securely
- Platform connection status in Settings
- Direct publishing to connected accounts

#### 6. Functional Automation Workflows
**Priority: MEDIUM** | Estimated: 6-8 hours
- Backend edge function for scheduled job processing
- CRON-like triggers for recurring content
- Template execution with AI generation
- Workflow state management

### Nice to Have (Polish)

#### 7. Activity Charts in Analytics
**Priority: LOW** | Estimated: 2-3 hours
- Time-series chart using Recharts
- Posts per day/week visualization
- Platform breakdown over time

#### 8. Content Duplication
**Priority: LOW** | Estimated: 1 hour
- Clone post functionality
- Pre-fill creation form with cloned content

#### 9. Onboarding Flow Improvements
**Priority: LOW** | Estimated: 2-3 hours
- Guided first-time user experience
- Prompt to create brand before first post
- Tutorial tooltips

#### 10. Upgrade/Payment Integration
**Priority: LOW** (for MVP) | Estimated: 4-6 hours
- Stripe integration for subscriptions
- Payment processing
- Plan management

---

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** component library
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Framer Motion** for animations

### Backend (Lovable Cloud / Supabase)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with RLS policies
- **Storage**: Supabase Storage buckets
  - `brand-guidelines` (private) - PDF, Word, Text files
  - `content-media` (public) - Post images
- **Edge Functions**:
  - `generate-post-content` - AI content generation
  - `generate-content-image` - AI image generation
  - `parse-brand-guidelines` - Document parsing

### AI Integration (Lovable AI Gateway)
- **Gemini 3 Flash** - Content generation
- **Gemini 2.5 Flash** - Document parsing (multimodal)
- **Gemini 2.5 Flash Image** - Image generation

### Database Schema
| Table | Purpose |
|-------|---------|
| `profiles` | User profile data |
| `subscriptions` | Trial/subscription status |
| `brands` | Brand configurations |
| `brand_guidelines` | Uploaded documents with parsed content |
| `content_library` | All posts with variations |
| `analytics` | Performance metrics |

---

## 🚀 Launch Checklist

### Before Alpha/Beta
- [ ] Implement Finalize step (save to library)
- [ ] Add brand selection to content creation
- [ ] Add scheduling with date/time picker
- [ ] Test full flow: Create Brand → Upload Guidelines → Generate Content → Save
- [ ] Mobile responsive testing
- [ ] Error handling for edge cases

### Before Public Launch
- [ ] Social media OAuth integrations (at least 1 platform)
- [ ] Stripe payment integration
- [ ] Email confirmation for signups
- [ ] Terms of Service & Privacy Policy pages
- [ ] Rate limiting on AI generation
- [ ] Usage tracking and limits

### Post-Launch
- [ ] Advanced automation workflows
- [ ] Performance analytics with external APIs
- [ ] Team collaboration features
- [ ] White-label / API access

---

## 🎨 Design System

**Style**: Modern & Minimal (Notion/Linear inspired)

### Colors (HSL in design tokens)
- Primary actions use brand accent color
- Semantic colors for platforms (Instagram pink, Twitter blue, etc.)
- Muted backgrounds for cards and sections
- High contrast for text readability

### Components
All UI components from shadcn/ui, customized with:
- Rounded corners (xl for cards, lg for buttons)
- Subtle shadows on hover
- Smooth transitions (150-200ms)
- Consistent spacing (4px grid)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Auth forms and protected routes
│   ├── brand/          # Brand guidelines upload
│   ├── create-post/    # Post creation components
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # App layout, header, sidebar
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks (useBrands, useContentGeneration, etc.)
├── pages/              # Route pages
└── integrations/       # Supabase client and types

supabase/
├── functions/          # Edge functions
└── config.toml         # Supabase configuration
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📝 Key User Flows

### New User Journey
1. Sign up → Auto-create profile and 7-day trial
2. Create first brand in Brand Studio
3. Upload brand guidelines (optional)
4. Create first post with AI generation
5. Save to library or schedule

### Daily Usage
1. Dashboard overview
2. Create new post → AI generates variations
3. Edit in Craft step
4. Save to library or schedule
5. Review calendar for upcoming posts

---

## 🔗 Links

- **Preview**: [Lovable Preview URL]
- **Documentation**: See `.lovable/plan.md` for detailed roadmap
- **Lovable Docs**: https://docs.lovable.dev
