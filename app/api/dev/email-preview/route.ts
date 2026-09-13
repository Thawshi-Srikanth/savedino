import { NextRequest, NextResponse } from "next/server";
import { renderSignInEmail } from "@/lib/email-templates/sign-in";
import {
  renderTeamJoinRequestEmail,
  renderTeamRequestAcceptedEmail,
  renderTeamRequestRejectedEmail,
  renderTeamInvitationEmail,
} from "@/lib/email-templates/team-request";
import { sendEmailInternal, EMAIL_SENDERS } from "@/lib/email";

function getTemplateData(type: string, baseUrl: string, recipientEmail?: string) {
  const targetRecipient = recipientEmail?.trim() || "citizen@example.com";

  switch (type) {
    case "request":
      return {
        name: "Squad Join Request",
        subject: "New Join Request for squad Apollo Asteroid Hunters - SaveDino",
        ...renderTeamJoinRequestEmail({
          leaderName: "Nuwan Jayasuriya",
          applicantName: "Kavindu Perera",
          applicantEmail: "kavindu.p@university.edu.lk",
          teamName: "Apollo Asteroid Hunters",
          campaignName: "All-Sri Lanka Asteroid Search 2026",
          message:
            "Hi! I am a physics undergraduate experienced with Astrometrica and would love to join your squad.",
          reviewUrl: `${baseUrl}/team/team_123?tab=requests`,
          recipientEmail: targetRecipient,
        }),
      };

    case "accepted":
      return {
        name: "Request Accepted",
        subject: "Squad Request Approved: Welcome to Apollo Asteroid Hunters! - SaveDino",
        ...renderTeamRequestAcceptedEmail({
          applicantName: "Kavindu Perera",
          teamName: "Apollo Asteroid Hunters",
          campaignName: "All-Sri Lanka Asteroid Search 2026",
          leaderName: "Nuwan Jayasuriya",
          workspaceUrl: `${baseUrl}/team/team_123`,
          recipientEmail: targetRecipient,
        }),
      };

    case "rejected":
      return {
        name: "Request Declined",
        subject: "Squad Application Update: Apollo Asteroid Hunters - SaveDino",
        ...renderTeamRequestRejectedEmail({
          applicantName: "Kavindu Perera",
          teamName: "Apollo Asteroid Hunters",
          campaignName: "All-Sri Lanka Asteroid Search 2026",
          exploreTeamsUrl: `${baseUrl}/teams`,
          recipientEmail: targetRecipient,
        }),
      };

    case "invitation":
      return {
        name: "Squad Invite Code",
        subject: "You are invited to join squad Apollo Asteroid Hunters - SaveDino",
        ...renderTeamInvitationEmail({
          inviteeName: "Kavindu Perera",
          inviterName: "Nuwan Jayasuriya",
          teamName: "Apollo Asteroid Hunters",
          campaignName: "All-Sri Lanka Asteroid Search 2026",
          inviteCode: "APOLLO-9X2",
          joinUrl: `${baseUrl}/join/apollo-9x2`,
          recipientEmail: targetRecipient,
        }),
      };

    case "signin":
    default:
      return {
        name: "Sign In (Magic Link)",
        subject: "Sign in to your SaveDino account - SEDS Sri Lanka",
        ...renderSignInEmail({
          url: `${baseUrl}/verify?token=sample_demo_token_123456&email=${encodeURIComponent(targetRecipient)}`,
          email: targetRecipient,
        }),
      };
  }
}

/**
 * GET: Development-only Email Preview Route themed with SaveDino Tech & Arcade Design System
 */
export async function GET(request: NextRequest) {
  // STRICT GUARD: Only accessible in local development
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "signin";
  const recipientEmail = searchParams.get("email") || "citizen@example.com";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "https://savedino.sedssl.org";

  const template = getTemplateData(type, baseUrl, recipientEmail);

  const format = searchParams.get("format");
  if (format === "raw") {
    return new NextResponse(template.html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  const defaultFrom = type === "signin" ? EMAIL_SENDERS.auth : EMAIL_SENDERS.squads;

  const fullStudioHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SaveDino // Email Testing Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Press+Start+2P&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #121315;
      color: #f3f4f6;
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .font-pixel { font-family: 'Press Start 2P', monospace; }
    .font-tech { font-family: 'Space Mono', monospace; }
    
    /* Top Studio Header */
    .studio-header {
      background: #1c1d21;
      border-bottom: 1px solid #38393e;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pixel-logo-badge {
      background: #8b5cf6;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 9px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 0 #6d28d9;
    }
    .studio-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Template Switcher Tabs */
    .template-nav {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .nav-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #121315;
      color: #94a3b8;
      border: 1px solid #38393e;
    }
    .nav-pill:hover {
      color: #f3f4f6;
      border-color: #8b5cf6;
      background: #1c1d21;
    }
    .nav-pill.active {
      background: #8b5cf6;
      color: #ffffff;
      border-color: #7c3aed;
      box-shadow: 0 2px 0 #6d28d9;
    }
    .nav-pill.active-green {
      background: #10b981;
      color: #ffffff;
      border-color: #059669;
      box-shadow: 0 2px 0 #047857;
    }

    /* Test Dispatch Controls Bar */
    .dispatch-bar {
      background: #121315;
      border: 1px solid #38393e;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .dispatch-form {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      width: 100%;
    }
    .input-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .input-label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .tech-input, .tech-select {
      background: #1c1d21;
      border: 1px solid #38393e;
      color: #f3f4f6;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 11px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .tech-input:focus, .tech-select:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 1px #8b5cf6;
    }
    .tech-select {
      cursor: pointer;
      font-weight: 600;
    }

    /* Arcade Action Button */
    .btn-arcade {
      background: #8b5cf6;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 8px 18px;
      border-radius: 6px;
      border: 1px solid #7c3aed;
      box-shadow: 0 3px 0 #6d28d9;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
      transition: transform 0.05s ease, box-shadow 0.05s ease, background-color 0.15s;
    }
    .btn-arcade:hover {
      background: #7c3aed;
    }
    .btn-arcade:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 #6d28d9;
    }
    .btn-arcade:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Status Alert */
    .status-box {
      display: none;
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 11px;
      margin-top: 6px;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid #10b981;
      color: #34d399;
    }
    .status-error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid #ef4444;
      color: #f87171;
    }

    /* Main Preview Viewport Frame */
    .preview-container {
      flex: 1;
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      background: radial-gradient(#26282e 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .preview-window-frame {
      width: 100%;
      max-width: 600px;
      background: #1c1d21;
      border: 1px solid #38393e;
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .window-header {
      background: #16171a;
      border-bottom: 1px solid #38393e;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .window-dots {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    .window-title {
      font-size: 11px;
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .theme-toggle-group {
      display: flex;
      align-items: center;
      gap: 3px;
      background: #121315;
      padding: 3px;
      border-radius: 6px;
      border: 1px solid #38393e;
      flex-shrink: 0;
    }
    .theme-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 10px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .theme-btn:hover {
      color: #f3f4f6;
    }
    .theme-btn.active {
      background: #8b5cf6;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }

    .rendered-email-wrap {
      background: #121315;
      width: 100%;
      border-radius: 0 0 16px 16px;
      min-height: 480px;
      display: flex;
    }
    .preview-iframe {
      width: 100%;
      border: none;
      display: block;
      height: 600px;
      background: #121315;
    }
  </style>
</head>
<body>

  <!-- Studio Header -->
  <header class="studio-header">
    <div class="header-inner">
      <div class="top-bar">
        <div class="brand-title">
          <span class="pixel-logo-badge font-pixel">SAVEDINO</span>
          <span class="font-tech studio-label">// EMAIL STUDIO (DARK MODE)</span>
        </div>

        <!-- Template Selector Tabs -->
        <nav class="template-nav">
          <a href="?type=signin" class="nav-pill ${type === "signin" ? "active" : ""}">
            <span>1. Magic Link</span>
          </a>
          <a href="?type=request" class="nav-pill ${type === "request" ? "active" : ""}">
            <span>2. Join Request</span>
          </a>
          <a href="?type=accepted" class="nav-pill ${type === "accepted" ? "active" : ""}">
            <span>3. Request Accepted</span>
          </a>
          <a href="?type=rejected" class="nav-pill ${type === "rejected" ? "active" : ""}">
            <span>4. Request Declined</span>
          </a>
          <a href="?type=invitation" class="nav-pill ${type === "invitation" ? "active" : ""}">
            <span>5. Squad Invite Code</span>
          </a>
        </nav>
      </div>

      <!-- Test Dispatch Form -->
      <div class="dispatch-bar">
        <form id="testEmailForm" class="dispatch-form" onsubmit="handleSendTestEmail(event)">
          <input type="hidden" name="type" value="${type}" />

          <!-- Recipient -->
          <div class="input-group">
            <label class="input-label font-tech">To:</label>
            <input
              type="email"
              name="to"
              id="toInput"
              required
              placeholder="recipient@example.com"
              class="tech-input font-tech"
              style="width: 220px;"
            />
          </div>

          <!-- Provider Selector -->
          <div class="input-group">
            <label class="input-label font-tech">Provider:</label>
            <select name="provider" id="providerSelect" class="tech-select font-sans">
              <option value="auto">Auto Failover (Resend &rarr; Brevo)</option>
              <option value="resend">Resend Only</option>
              <option value="brevo">Brevo Only</option>
            </select>
          </div>

          <!-- Custom Sender (Optional) -->
          <div class="input-group">
            <label class="input-label font-tech">From:</label>
            <input
              type="text"
              name="from"
              id="fromInput"
              value="${defaultFrom}"
              placeholder="SaveDino <login@savedino.sedssl.org>"
              class="tech-input font-tech"
              style="width: 260px;"
            />
          </div>

          <!-- Action Button -->
          <button type="submit" id="sendBtn" class="btn-arcade font-sans">
            <span>Send Test Email</span>
            <span>&rarr;</span>
          </button>
        </form>

        <!-- Status Result Alert -->
        <div id="statusResult" class="status-box font-tech"></div>
      </div>
    </div>
  </header>

  <!-- Main Viewport Preview -->
  <main class="preview-container">
    <div class="preview-window-frame" id="previewContainer">
      <div class="window-header">
        <div class="window-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="window-title font-tech">
          <span>${escapeHtml(template.name)} &bull; ${escapeHtml(template.subject)}</span>
        </div>
      </div>

      <!-- Rendered Email Content via Isolated Iframe -->
      <div class="rendered-email-wrap">
        <iframe
          id="emailPreviewFrame"
          class="preview-iframe"
          title="Email Template Preview"
        ></iframe>
      </div>
    </div>
  </main>

  <script>
    const templateType = "${type}";
    const emailRawHtml = ${JSON.stringify(template.html)};

    function renderPreview(htmlContent) {
      const iframe = document.getElementById("emailPreviewFrame");
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        doc.open();
        doc.write(htmlContent || emailRawHtml);
        doc.close();

        // Auto-adjust height to content
        setTimeout(() => {
          try {
            const h = doc.body ? Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) : 600;
            iframe.style.height = (h + 30) + "px";
          } catch(e) {}
        }, 80);
      } catch(err) {
        console.error("Failed to render preview iframe:", err);
      }
    }

    async function updatePreview(email) {
      try {
        const res = await fetch("/api/dev/email-preview?type=" + encodeURIComponent(templateType) + "&email=" + encodeURIComponent(email || "citizen@example.com") + "&format=raw");
        if (res.ok) {
          const html = await res.text();
          renderPreview(html);
        }
      } catch (e) {
        console.error("Live preview error:", e);
      }
    }

    window.addEventListener("DOMContentLoaded", () => {
      renderPreview();
      const toInput = document.getElementById("toInput");
      if (toInput) {
        let debounceTimer;
        toInput.addEventListener("input", (e) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const val = e.target.value.trim();
            if (val && val.includes("@")) {
              updatePreview(val);
            }
          }, 300);
        });
      }
    });

    async function handleSendTestEmail(e) {
      e.preventDefault();
      const sendBtn = document.getElementById("sendBtn");
      const statusResult = document.getElementById("statusResult");
      const to = document.getElementById("toInput").value;
      const provider = document.getElementById("providerSelect").value;
      const from = document.getElementById("fromInput").value;
      const type = "${type}";

      sendBtn.disabled = true;
      sendBtn.innerHTML = "Sending...";
      statusResult.style.display = "none";
      statusResult.className = "status-box font-tech";

      try {
        const res = await fetch("/api/dev/email-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, to, provider, from }),
        });

        const data = await res.json();
        statusResult.style.display = "block";

        if (data.success) {
          statusResult.className = "status-box font-tech status-success";
          const modeLabel = data.simulated ? "(Simulated Console Output)" : "(Delivered Live)";
          statusResult.innerHTML = "[SUCCESS] Dispatched via <strong>" + (data.provider || "provider").toUpperCase() + "</strong> to " + to + " " + modeLabel;
        } else {
          statusResult.className = "status-box font-tech status-error";
          statusResult.innerHTML = "[ERROR] " + (data.error || "Failed to send test email");
        }
      } catch (err) {
        statusResult.style.display = "block";
        statusResult.className = "status-box font-tech status-error";
        statusResult.innerHTML = "[NETWORK ERROR] " + (err.message || err);
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = "Send Test Email &rarr;";
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(fullStudioHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST: Development-only endpoint to dispatch a live test email
 */
export async function POST(request: NextRequest) {
  // STRICT GUARD: Only accessible in local development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, to, provider = "auto", from, replyTo } = body;

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { success: false, error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://savedino.sedssl.org";

    const targetTo = to.trim();
    const template = getTemplateData(type || "signin", baseUrl, targetTo);

    const result = await sendEmailInternal({
      to: targetTo,
      subject: template.subject,
      html: template.html,
      text: template.text,
      from: from ? from.trim() : undefined,
      replyTo: replyTo ? replyTo.trim() : undefined,
      provider: provider as "auto" | "resend" | "brevo",
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[POST /api/dev/email-preview Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to dispatch test email" },
      { status: 500 }
    );
  }
}
