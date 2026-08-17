export const metadata = {
  title: "Privacy Policy",
  description: "How pitchNpivot collects, uses, and protects your data.",
};

const UPDATED = "July 9, 2026";
const CONTACT = "pitchnpivot@gmail.com";

export default function PrivacyPage() {
  return (
    <main>
      <section className="legal">
        <span className="label">Privacy</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,42px)" }}>
          Privacy policy
        </h1>
        <p className="legal-meta">Last updated: {UPDATED}</p>

        <p>
          pitchNpivot (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a talent marketplace where people
          showcase short video pitches and employers verify real completed work. This policy
          explains what we collect, why, who we share it with, and the control you have. It applies
          to pitchnpivot.com and covers everyone who uses the service.
        </p>

        <h2>Who runs pitchNpivot</h2>
        <p>
          pitchNpivot is operated by an individual based in New Jersey, USA. For any privacy
          question or request, contact <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>Account information.</strong> Your email address and a securely hashed password
          (we never see or store your password in readable form), your name, and whether you signed
          up as an Individual or a Manager. If you sign in with GitHub, we receive your email and
          basic profile details from GitHub.
        </p>
        <p>
          <strong>Profile information you choose to provide.</strong> Individuals: username, job
          title, location, bio, skills, availability, work preference, years of experience, rate,
          education, pronouns, and any links you add (portfolio, GitHub, LinkedIn, website, social).
          Managers: name, company, role, company description, size, industries, location, and
          website.
        </p>
        <p>
          <strong>Content you post.</strong> Pitch reels (a title, skill tags, a visibility setting,
          and a link to a video you host elsewhere), portfolio projects, job and project postings,
          applications and submissions (including any notes and links you attach).
        </p>
        <p>
          <strong>Activity on the platform.</strong> Connection requests, saved reels, direct
          messages, notifications, and employer verifications issued to or by you.
        </p>
        <p>
          <strong>Technical data.</strong> Our hosting provider records standard server logs
          (including IP address, browser type, and pages requested) for security and reliability.
        </p>
        <p>
          <strong>We do not collect</strong> payment card details, government identification,
          precise location, or biometric data. We do not currently run advertising or third-party
          analytics trackers.
        </p>

        <h2>What is public</h2>
        <p>
          Some information is intentionally public — it is the point of the product. Anyone on the
          internet, signed in or not, can see:
        </p>
        <ul>
          <li>Your public profile at pitchnpivot.com/u/your-username</li>
          <li>Any reel you mark <strong>Public</strong>, including its title and skill tags</li>
          <li>
            Employer-verified credentials, including the verifying employer&rsquo;s name and
            company, the project title, the date, and any note they wrote
          </li>
          <li>Reels shown in the public Discover feed</li>
        </ul>
        <p>
          Public profiles and credential pages are listed in our sitemap and can be indexed by
          search engines such as Google. Reels you mark <strong>Private</strong> are not shown
          publicly. Direct messages, your email address, applications, and submissions are not
          public.
        </p>

        <h2>How we use your information</h2>
        <ul>
          <li>To operate your account and show your profile and reels</li>
          <li>To let employers post work, receive applications, and issue verifications</li>
          <li>To rank and surface talent in discovery (verified credentials rank higher)</li>
          <li>To deliver messages, connection requests, and notifications</li>
          <li>To send essential service email, such as confirming your address</li>
          <li>To keep the platform secure and investigate misuse</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not share it with advertisers.
        </p>

        <h2>Service providers we rely on</h2>
        <ul>
          <li>
            <strong>Supabase</strong> — database, authentication, and storage of the data described
            above.
          </li>
          <li>
            <strong>Vercel</strong> — website hosting and content delivery, including server logs.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional email (for example, confirming your
            email address).
          </li>
          <li>
            <strong>GitHub</strong> — only if you choose to sign in with GitHub.
          </li>
          <li>
            <strong>Google Fonts</strong> — fonts are loaded from Google, which means Google
            receives a request from your browser.
          </li>
        </ul>
        <p>
          These providers process data on our behalf. Our infrastructure is located in the United
          States, so if you use pitchNpivot from elsewhere, your information is transferred to and
          stored in the US.
        </p>

        <h2>Video hosting</h2>
        <p>
          We do not host or store your video files. Your reels live on third-party platforms such as
          YouTube, Vimeo, or Loom, and we store only the link. When a video is played or previewed
          on pitchNpivot, that platform may set its own cookies and collect data under its own
          privacy policy. Deleting a reel from pitchNpivot removes the link from our platform but
          does not delete the video from the service hosting it — you must do that there.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies that are strictly necessary to keep you signed in and to secure the sign-in
          process. We also store small preferences in your browser, such as whether you prefer the
          tile or table view on the Jobs page. We do not use advertising or cross-site tracking
          cookies.
        </p>

        <h2>Employer verifications are permanent</h2>
        <p>
          When an employer verifies one of your reels, that verification is recorded as a permanent,
          cryptographically signed credential — that permanence is what makes it trustworthy. It
          cannot be removed through the normal interface. If a verification was issued in error or
          fraudulently, contact us and we will investigate.
        </p>

        <h2>How long we keep data</h2>
        <p>
          We keep your information for as long as your account exists. If you delete your account,
          we delete your profile, reels, portfolio, applications, connections, and messages. Records
          that others rely on — such as a verification an employer issued, or a message already
          delivered to another person&rsquo;s inbox — may persist. Backups and server logs may
          retain data for a limited period after deletion.
        </p>

        <h2>Your rights and choices</h2>
        <ul>
          <li>
            <strong>Access and correct.</strong> Most of your data is editable directly in your
            profile, reel manager, and portfolio.
          </li>
          <li>
            <strong>Control visibility.</strong> Every reel and portfolio project has a
            public/private setting.
          </li>
          <li>
            <strong>Delete.</strong> Email us to request deletion of your account and data.
          </li>
          <li>
            <strong>Copy of your data.</strong> Email us and we will provide the personal data we
            hold about you.
          </li>
        </ul>
        <p>
          Depending on where you live, you may have additional rights under laws such as the GDPR or
          the CCPA — including objecting to processing or lodging a complaint with your local data
          protection authority. Email{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will honour applicable requests. We do
          not sell personal information under the CCPA.
        </p>

        <h2>Security</h2>
        <p>
          Access to data is enforced at the database level so that, for example, only you can read
          your own messages and only an employer who posted a project can verify work submitted to
          it. Passwords are hashed by our authentication provider, and traffic is encrypted over
          HTTPS. No online service can promise perfect security, but we take these safeguards
          seriously and will notify affected users if a breach materially affects them.
        </p>

        <h2>Children</h2>
        <p>
          pitchNpivot is intended for people aged 18 and over. We do not knowingly collect
          information from anyone under 18. If you believe a minor has created an account, contact
          us and we will remove it.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we make a significant change, we will update the date at the top of this page and,
          where appropriate, notify you in the app or by email.
        </p>

        <h2>Contact</h2>
        <p>
          Questions, requests, or complaints:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </section>
    </main>
  );
}
