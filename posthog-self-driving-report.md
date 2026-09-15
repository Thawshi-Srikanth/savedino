# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for SaveDino. Session Replay, Error Tracking, and Support were enabled, and native responders for setup health, error-tracking changes, and support tickets were added. Findings will start appearing in the [Self-driving inbox](https://eu.posthog.com/project/274266/inbox) within about 30 minutes.

## AI data processing

Approved.

## GitHub

GitHub was already connected before this run.

## Products enabled

| Product | Status | Web SDK check |
|---|---|---|
| Session Replay | enabled | `posthog.init` has no disabling session-recording override. |
| Error Tracking | enabled | `capture_exceptions: true` is already set in `instrumentation-client.ts`. |
| Support | enabled | Connect an inbound email, inbox, or Slack channel in PostHog before tickets can arrive. |

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | On by default; no row is needed. |
| `health_checks` | `health_issue` | Enabled — source config `01a0a3f1-3a09-775b-a64a-15bc2864214c`. |
| `error_tracking` | `issue_created` | Enabled — source config `01a0a3f1-3a11-77e3-bfa6-19214d929986`. |
| `error_tracking` | `issue_reopened` | Enabled — source config `01a0a3f1-3aa6-7840-b355-46a31b4a47f5`. |
| `error_tracking` | `issue_spiking` | Enabled — source config `01a0a3f1-3a24-7a94-bd8f-7178ad098d35`. |
| `conversations` | `ticket` | Enabled — source config `01a0a3f1-3ac5-7279-9c74-c85b97ae950c`; dormant until a Support channel is connected. |
| `session_replay` | `session_analysis_cluster` | Skipped: retired route. Replay observations are covered by Replay Vision scanners. |
| `replay_vision` | scanner findings | Enabled through each scanner's `emits_signals` setting; no source-config row was created. |

## Connected tools

The connected-tools selection was cancelled, so no optional issue-tracker, error-tracker, support-desk, warehouse, security, feedback, or search responder was enabled. GitHub remains connected but GitHub Issues was not authorized as a Self-driving source in this run.

## Scout troop

Enabled scouts (daily schedule, emitting to the inbox):

| Scout | Why it is enabled |
|---|---|
| `signals-scout-general` | Covers cross-product patterns and gaps not owned by a specialist. |
| `signals-scout-product-analytics` | Covers SaveDino’s instrumented activation and product-flow behavior. |
| `signals-scout-web-analytics` | Covers web traffic, attribution, landing-page, bounce, and 404 shifts. |
| `signals-scout-health-checks` | Groups actionable PostHog setup-health issues. |

23 other built-in scouts remain disabled to keep the troop focused. `signals-scout-error-tracking` is covered by the native Error Tracking responders and `signals-scout-session-replay` is covered by the Replay Vision scanners. Other surface-specific scouts can be enabled later if their corresponding PostHog product becomes active.

**Verified run budget:** 100 runs/day; 0 used today; 100 remaining. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

No custom scouts were created. Two focused candidates were proposed and declined:

- **Squad formation and matching:** would watch squad creation, join requests, and successful matching for a demand/supply imbalance. It was candidate coverage because the built-in product-analytics scout only watches generic saved-flow regressions.
- **Campaign discovery submissions:** would watch campaign creation progressing to discovery report submissions and flag meaningful stalls. No built-in scout owns campaign-to-discovery fulfillment specifically.

If a future custom scout becomes noisy, set `emit: false` on its PostHog scout config to keep it in dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes verified findings to the Self-driving inbox. These are the only items in this setup that spend Replay Vision quota; findings arrive at half weight and require corroboration before promotion into a report.

| Status | Scanner | Scope | Sampling | Estimate |
|---|---|---|---:|---:|
| Created | Campaign and discovery flow breakage | Recordings whose URL contains `/campaigns`, the campaign, squad, image-set, and discovery-report completion area. | 50% | 0 observations/month; 0 credits/month |
| Created | SaveDino participant frustration | Recordings containing `$rageclick` only; no URL filter, to preserve independent coverage. | 100% | 0 observations/month; 0 credits/month |

No recordings were found during setup, so both scanners are armed and will begin working when recordings arrive. The organization has 2,500 Replay Vision credits remaining for the current period and no projected scanner spend yet.

## Files created or modified

| Path | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |
| `.claude/skills/replay-vision-scanners-core/` | Installed shared Replay Vision scanner workflow reference. |
| `.claude/skills/replay-vision-scanner-broken-experiences/` | Installed the breakage-monitor brief. |
| `.claude/skills/replay-vision-scanner-user-frustration/` | Installed the user-frustration-monitor brief. |

No application source files were modified.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog to begin receiving support-ticket findings.
- [ ] Optionally authorize GitHub Issues or another connected tool later if you want Self-driving to read open records and automatically open draft PRs for records it judges fixable.
- [ ] Rate initial Replay Vision observations in their scanner pages to improve future recommendations.

## What happens next

Fresh scout configurations are picked up by the coordinator within about 30 minutes and draw from the verified daily budget. Replay Vision scanners will also begin when session recordings are available. Findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/274266/inbox), where immediately actionable reports can start coding tasks.
