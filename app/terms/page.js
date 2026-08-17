export const metadata = {
  title: "Terms of Use",
  description: "The rules for using pitchNpivot.",
};

const UPDATED = "July 9, 2026";
const CONTACT = "pitchnpivot@gmail.com";

export default function TermsPage() {
  return (
    <main>
      <section className="legal">
        <span className="label">Terms</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,42px)" }}>
          Terms of use
        </h1>
        <p className="legal-meta">Last updated: {UPDATED}</p>

        <p>
          These terms are an agreement between you and pitchNpivot. By creating an account or using
          pitchnpivot.com, you agree to them. If you do not agree, please do not use the service.
        </p>

        <h2>1. What pitchNpivot is</h2>
        <p>
          pitchNpivot is a marketplace where Individuals post short video pitches (&ldquo;reels&rdquo;)
          demonstrating their skills, and Managers post projects and jobs, review submitted work, and
          may issue verifications confirming that real work was completed. We provide the platform.
          We are not an employer, a recruiter, an agency, or a party to any arrangement you make with
          another user.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old to use pitchNpivot. You must provide accurate information
          when you register and keep it up to date. One person or organisation per account; you are
          responsible for everything that happens under your account and for keeping your password
          secure.
        </p>

        <h2>3. Your content</h2>
        <p>
          You keep ownership of everything you post — your reels, profile, portfolio, postings, and
          messages. By posting, you grant us a non-exclusive, worldwide, royalty-free licence to
          host, display, and distribute that content for the purpose of operating and promoting the
          service. This licence ends when you delete the content, except where it has already been
          shared with others or is part of a verification record.
        </p>
        <p>
          You confirm that you have the right to post what you post, that it is your own work or you
          have permission to use it, and that it does not infringe anyone else&rsquo;s rights.
          Because videos are hosted on third-party platforms, their terms apply to the video itself.
        </p>

        <h2>4. Verifications</h2>
        <p>This is the core of pitchNpivot, so the rules matter:</p>
        <ul>
          <li>
            A verification is an attestation by a Manager that they reviewed the work and that the
            reel accurately represents what the Individual did.
          </li>
          <li>
            <strong>Do not issue false verifications.</strong> Verifying work that was not performed,
            or that you did not review, is a serious misuse of the platform and grounds for
            immediate removal.
          </li>
          <li>
            <strong>Verifications are permanent.</strong> They are recorded with the verifying
            employer&rsquo;s identity, company, timestamp, and project, and are cryptographically
            signed. They are publicly visible and cannot be withdrawn through the normal interface.
            Issue them deliberately.
          </li>
          <li>
            Only the Manager who posted the project or job can verify work submitted to it.
          </li>
          <li>
            We may remove or annotate a verification we determine to be fraudulent, but we do not
            independently audit the underlying work and make no guarantee about its quality.
          </li>
        </ul>

        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Misrepresent your identity, experience, employer, or work</li>
          <li>Impersonate another person or company</li>
          <li>Post unlawful, harassing, hateful, deceptive, or sexually explicit content</li>
          <li>Post spam, scams, or fake job or project listings</li>
          <li>Send unsolicited bulk messages to other users</li>
          <li>Scrape, crawl, or bulk-collect data about users except as our robots.txt permits</li>
          <li>Attempt to bypass access controls, security, or another user&rsquo;s privacy settings</li>
          <li>Interfere with or overload the service</li>
        </ul>

        <h2>6. Work, pay, and relationships between users</h2>
        <p>
          Any project, job, engagement, payment, or contract is strictly between the users involved.
          pitchNpivot does not process payments, does not guarantee that a job or project is
          genuine, does not guarantee that anyone will be hired or paid, and does not vet, screen,
          background-check, or endorse any user. Verify who you are dealing with, agree terms in
          writing, and use your own judgement — particularly before doing unpaid work or sharing
          anything sensitive.
        </p>

        <h2>7. Public information</h2>
        <p>
          Your public profile, public reels, and verified credentials are visible to anyone and may
          be indexed by search engines. You control the public/private setting on each reel and
          portfolio project. Do not post anything publicly that you would not want widely seen. See
          our <a href="/privacy">privacy policy</a> for details.
        </p>

        <h2>8. Suspension and termination</h2>
        <p>
          You may stop using pitchNpivot at any time and can request deletion of your account by
          emailing us. We may suspend or remove an account that breaks these terms, harms other
          users, or exposes us to legal risk. Where it is reasonable to do so, we will tell you why.
        </p>

        <h2>9. Availability</h2>
        <p>
          pitchNpivot is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. It is an early
          stage product: features may change, and we do not promise uninterrupted or error-free
          service. We may modify or discontinue features at any time.
        </p>

        <h2>10. Disclaimers and limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we disclaim all warranties, express or implied,
          including merchantability, fitness for a particular purpose, and non-infringement. We are
          not liable for indirect, incidental, special, consequential, or punitive damages, or for
          lost profits, lost opportunities, unpaid work, or lost data arising from your use of the
          service or from your dealings with other users. Our total liability for any claim relating
          to the service is limited to the greater of the amount you paid us in the twelve months
          before the claim (currently zero, as the service is free) or one hundred US dollars
          (US$100). Some jurisdictions do not allow certain limitations, so parts of this section may
          not apply to you.
        </p>

        <h2>11. Indemnity</h2>
        <p>
          You agree to indemnify and hold us harmless from claims, damages, and reasonable legal
          costs arising from content you post, your use of the service, your dealings with other
          users, or your breach of these terms.
        </p>

        <h2>12. Changes to these terms</h2>
        <p>
          We may update these terms. If a change is significant, we will update the date at the top
          and, where appropriate, notify you. Continuing to use pitchNpivot after a change means you
          accept the updated terms.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These terms are governed by the laws of the State of New Jersey, USA, without regard to
          its conflict-of-laws rules. Disputes will be handled by the state or federal courts located
          in New Jersey, and you consent to that jurisdiction.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </section>
    </main>
  );
}
