# README.md — Indian Daily Rarity Trivia

## 1. Project Overview

Build an India-focused daily trivia game inspired by the gameplay mechanics of Krillion and the architecture concepts explored in Deep Ball.

The game gives every player the same set of daily questions. Players submit answers, and their score depends on how rare their answers are compared with everyone else's.

The core differentiator is its Indian cultural identity:

- Bollywood and Indian cinema
- Cricket and sports
- Indian history and geography
- Indian internet culture and memes
- Indian food
- 90s and 2000s nostalgia
- Regional culture, personalities and entertainment

The product should feel familiar to Indian internet users while remaining accessible to anyone.

**Important:** Build an original product. Do not copy proprietary game assets, branding, question content or source code.

---

## 2. Core Product Experience

### Daily game

- Seven questions per day.
- 25 seconds per question.
- Every player receives the same questions for a given day.
- One answer per question.
- Answers are scored according to their rarity.
- Players can see their daily and all-time leaderboard positions.
- Previous daily games are available in an archive.
- Players can initially participate using a nickname without mandatory registration.

The daily game should be designed around a simple, fast gameplay loop.

### Rarity-based scoring

The objective is not simply to give the most obvious correct answer.

For example:

Question: Name an Indian actor.

| Answer | Relative rarity |
|---|---|
| Shah Rukh Khan | Common |
| Salman Khan | Common |
| Manoj Bajpayee | Less common |
| Pankaj Tripathi | Less common |
| Naseeruddin Shah | Rare |

The less frequently players submit a valid answer, the higher its score.

Only valid canonical answers should contribute to rarity calculations.

---

## 3. Frontend Identity — The Flying Kite

This is the most important visual requirement.

The central game visual should be an Indian kite (patang) flying in the sky.

**The higher the rarity of the player's answers, the higher the kite flies.**

Do not build a generic trivia dashboard with a score counter. The kite should be the defining element of the product.

### Gameplay visual

- Display a large sky-like visual area.
- Place the player's kite in the sky, connected to a visible string.
- Start the kite relatively low.
- After each submitted answer, animate the kite moving upwards according to the points earned.
- A common answer should produce a small upward movement.
- A rare answer should produce a noticeably larger upward movement.
- The final kite altitude should represent the player's total performance across all seven questions.

### Results screen

Show:
- Final kite altitude.
- Total score.
- Correct answers.
- Rarity of individual answers.
- Comparison with other players.
- Daily leaderboard position.

### Visual direction

Use a modern, clean interface with Indian visual influences.

Suggested visual elements:
- Colourful Indian patangs.
- Blue sky gradients.
- Subtle clouds.
- A visible kite string.
- Smooth upward animation.
- Small celebratory effects for exceptionally rare answers.

Avoid making the interface look like a children's game. It should feel like a polished modern gaming product.

### Implementation requirements

- Prefer SVG and CSS animations for the kite and its string.
- Use smooth transitions between altitude positions.
- Keep animation responsive across desktop and mobile.
- Do not use a static background image as a replacement for the actual kite animation.
- Keep gameplay state and animation state separate.
- Make sure the game remains usable if animations are disabled or fail.

The kite's altitude must be derived from the actual score. Do not let the frontend independently calculate or modify scores.

---

## 4. Technology Stack

Use the following stack unless a genuine technical limitation requires a change.

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js API routes / server-side services |
| Database | PostgreSQL |
| ORM | Prisma |
| Queue | BullMQ |
| Queue storage | Redis |
| AI provider | Groq API |
| Validation | Zod |
| Deployment | Vercel for web application |
| Background worker | Separate Node.js worker deployment |
| Styling | Tailwind CSS |

Keep the Groq integration behind a provider abstraction so that another LLM provider can be added later.

Use environment variables for model IDs, API keys and configuration. Do not hardcode model names throughout the application.

---

## 5. High-Level Architecture

```text
                   PLAYER
                     |
                     v
              NEXT.JS FRONTEND
                     |
                     v
              NEXT.JS API LAYER
                     |
          +----------+----------+
          |                     |
          v                     v
     POSTGRESQL              REDIS
          |                     |
          |                     v
          |                BULLMQ
          |                     |
          |              BACKGROUND WORKER
          |                     |
          |                     v
          |                  GROQ API
          |                     |
          +---------------------+
```

The frontend must never receive the complete answer key for the daily game.

All answer validation, scoring and leaderboard calculations must happen on the server.

Use a separate worker process for background jobs. Do not assume that long-running BullMQ workers can run reliably inside serverless API routes.

---

## 6. Database Design

Use PostgreSQL with Prisma.

Create the following logical entities. Adjust the exact schema where necessary, but preserve their responsibilities.

### Users / Players

- id
- nickname
- anonymous_player_id
- created_at

Support anonymous participation initially.

Do not require OAuth or complex account management for the MVP.

### Questions

- id
- question_text
- category
- subcategory
- difficulty
- language
- status
- scheduled_date
- explanation
- created_at

Question statuses:

`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PUBLISHED`, `REJECTED`, `ARCHIVED`

### Entities

Represents canonical answers.

- id
- canonical_name
- entity_type
- metadata (JSONB)
- created_at

Examples: actors, films, cricketers, cities and historical personalities.

### Entity Aliases

- id
- entity_id
- alias
- normalized_alias
- language

Multiple spellings and nicknames should map to the same canonical entity.

### Question Valid Entities

A join table connecting questions to their accepted answers.

- question_id
- entity_id

An entity being present in the database does not automatically mean it is a valid answer to every question.

### Daily Games

- id
- game_date
- status
- published_at

### Daily Game Questions

- daily_game_id
- question_id
- question_order
- rarity_snapshot_id

### Submissions

- id
- player_id
- question_id
- raw_answer
- normalized_answer
- canonical_entity_id
- validation_status
- submitted_at

### Rarity Snapshots

Store the rarity information used for scoring a particular daily game.

- id
- question_id
- entity_id
- estimated_frequency
- observed_frequency
- final_frequency
- scoring_version

### Scores

- id
- player_id
- daily_game_id
- total_score
- completed_at

Use appropriate indexes, foreign keys and unique constraints. Prevent duplicate submissions for the same player and question.

---

## 7. Answer Validation Architecture

This is a critical component.

The application must distinguish between:

1. Answer validity: Is this answer factually valid for the question?
2. Entity resolution: Does this answer refer to an existing canonical entity?

Example:

Question: Name an Indian actor.

Possible submissions:
- Shah Rukh Khan
- SRK
- Shahrukh Khan
- shah rukh khan

All four should map to the same canonical entity.

### Validation pipeline

```text
PLAYER SUBMISSION
       |
       v
TEXT NORMALIZATION
       |
       v
EXACT CANONICAL MATCH
       |
       v
ALIAS MATCH
       |
       v
FUZZY MATCH
       |
       +------ MATCH FOUND ------> ACCEPT
       |
       v
UNSEEN ANSWER
       |
       v
BACKGROUND BULLMQ JOB
       |
       v
GROQ VALIDATION
       |
       +------ VALID -----------> MAP TO ENTITY
       |
       +------ INVALID --------> REJECT
       |
       +------ UNCERTAIN -------> HUMAN REVIEW
```

### Stage 1: Text normalization

Implement:
- Lowercase conversion.
- Leading/trailing whitespace removal.
- Repeated whitespace removal.
- Punctuation normalization.
- Unicode normalization.
- Diacritic normalization where appropriate.

Keep the original submitted answer for auditing.

### Stage 2: Canonical and alias lookup

Search the canonical entity table and alias table.

Use normalized aliases.

### Stage 3: Fuzzy matching

Use PostgreSQL `pg_trgm` for approximate string matching.

Avoid incorrectly mapping two different people or entities simply because their names look similar.

### Stage 4: Groq validation

Call Groq only when deterministic matching cannot resolve an answer.

The LLM should return structured JSON containing:

- is_valid
- canonical_name
- entity_type
- aliases
- confidence
- explanation
- evidence/source references

Validate the returned structure using Zod.

The LLM must not directly insert or modify production database records.

Any new entity must go through backend validation and the appropriate approval rules.

### Stage 5: Human review

Low-confidence or ambiguous answers should enter a review queue.

Cache validation results using a combination of question ID and normalized answer.

If 100 players submit the same unseen answer, the system must not make 100 Groq requests.

### Scoring safety

Unverified answers must not affect final rarity calculations.

For the MVP, allow unresolved submissions to remain pending. Finalize their score only after validation.

Do not count invalid or pending answers in the final frequency denominator.

---

## 8. Rarity Scoring System

Use a Deep Ball-inspired Bayesian approach.

Initially, actual player data will be limited. Therefore, the system needs estimated answer-frequency priors.

For each valid canonical entity:

```text
estimated_share =
    (prior_share * prior_strength + observed_count)
    /
    (prior_strength + total_observed_answers)
```

Where:

- `prior_share` is the initial estimated frequency.
- `prior_strength` controls how much the prior influences early results.
- `observed_count` is the number of actual valid submissions for that entity.
- `total_observed_answers` is the total valid submissions for that question.

Use an initial prior strength of 1000 as a configurable starting point, not a permanent constant.

Over time, actual player responses should increasingly influence the rarity calculation.

### Important scoring requirements

- Calculate rarity using canonical entity IDs.
- Use a fixed rarity snapshot for each daily game.
- Do not allow the score to change unpredictably while a player is playing.
- Store the scoring version used for each game.
- Handle low sample sizes carefully.
- Make score thresholds configurable.

The final score should reward rare valid answers.

The kite's altitude should be derived from the total score using a normalized mapping to a defined flight range.

Keep the scoring formula on the backend.

---

## 9. AI Question Generation System

The application should automatically generate potential daily questions.

Use Groq for generation, with the model configured through environment variables.

The AI should generate three candidate questions per day.

Each candidate should contain:

```json
{
  "question": "Name an Indian film directed by Rajkumar Hirani",
  "category": "Bollywood",
  "subcategory": "Directors",
  "difficulty": "medium",
  "language": "en",
  "accepted_answers": [
    {
      "canonical_name": "3 Idiots",
      "aliases": ["Three Idiots"]
    }
  ],
  "explanation": "The film was directed by Rajkumar Hirani.",
  "sources": [
    {
      "title": "Verified source title",
      "url": "https://example.com"
    }
  ]
}
```

This is an illustrative schema. Actual source URLs must be verified. Never allow the LLM to invent sources and treat them as evidence.

### Generation pipeline

```text
SCHEDULED TRIGGER
       |
       v
GENERATE 3 CANDIDATES
       |
       v
FACTUAL VALIDATION
       |
       v
ANSWER COMPLETENESS CHECK
       |
       v
DUPLICATE DETECTION
       |
       v
CULTURAL RELEVANCE CHECK
       |
       v
PENDING APPROVAL
       |
       v
ADMIN APPROVAL
       |
       v
PUBLISHED QUESTION BANK
```

### Quality checks

Every candidate must be evaluated for:

- Factual correctness.
- Clear and unambiguous wording.
- Answer completeness.
- Duplicate or near-duplicate questions.
- Cultural relevance.
- Appropriate difficulty.
- Potential for interesting rarity distribution.
- Valid and verifiable sources.

Prefer multiple independent sources for factual claims where practical.

Keep generated questions in a separate candidate bank until approved.

### Question lifecycle

`GENERATED → VALIDATING → PENDING_APPROVAL → APPROVED → PUBLISHED`

Rejected candidates should also be retained for audit and duplicate avoidance.

---

## 10. Admin Approval System

The developer should build a simple admin interface.

The admin should be able to:

- View generated candidates.
- Read the question and its accepted answers.
- Inspect sources.
- Edit the wording.
- Add or remove accepted answers.
- Approve a question.
- Reject a question.

Use Telegram notifications with inline approval actions as the initial notification mechanism.

### Proposed schedule

All times use `Asia/Kolkata`.

- 8:00 PM — Generate three candidates.
- 8:15 PM — Run validation and duplicate checks.
- 9:00 PM — Make candidates available for review.
- 10:00 PM — Send Telegram notification for approval.

Do not automatically publish generated questions.

Only an explicit admin approval can promote a candidate to the approved question bank.

The approval endpoint must be authenticated and idempotent.

---

## 11. Groq API Integration

Use the free Groq API initially.

Groq should be used for:

1. Resolving unseen player answers.
2. Generating candidate questions.
3. Evaluating ambiguity or answer completeness where deterministic checks are insufficient.

Do not call the LLM for every player submission.

### Requirements

- Store the API key securely in environment variables.
- Make the model configurable.
- Use structured outputs where supported.
- Validate all LLM responses.
- Implement retries with exponential backoff.
- Respect free-tier rate limits.
- Limit worker concurrency.
- Cache repeated requests.
- Track token usage and failed requests.
- Log model and prompt versions.

If Groq is unavailable, the game should continue using known canonical answers and aliases.

Do not make the entire gameplay experience dependent on real-time LLM availability.

---

## 12. Leaderboards and Game History

Implement:

- Daily leaderboard.
- All-time leaderboard.
- Player's personal game history.
- Archive of previous daily challenges.

Leaderboard calculations must use finalized scores.

Avoid exposing other players' raw submissions or personal information unnecessarily.

For the MVP, anonymous nickname-based participation is sufficient.

---

## 13. Security and Reliability

Important requirements:

- Never expose accepted answer keys to the frontend.
- Validate every submission server-side.
- Enforce one answer per question.
- Prevent duplicate scoring.
- Protect admin endpoints.
- Rate-limit submissions and AI-triggering requests.
- Validate all incoming data.
- Use transactions for score and submission updates.
- Make background jobs idempotent.
- Keep secrets out of Git.
- Use database migrations.
- Maintain structured application logs.

Do not trust client-provided scores, timestamps, rarity values or canonical entity IDs.

The server is the source of truth.

---

## 14. Implementation Phases

Do not build everything in one pass.

Work in small, testable phases.

### Phase 1 — Project Foundation

- Initialize Next.js with TypeScript.
- Configure Tailwind.
- Configure PostgreSQL.
- Set up Prisma.
- Create initial database schema.
- Configure environment variables.
- Create the basic application layout.

Deliverable: Application starts locally and connects to the database.

### Phase 2 — Game UI and Kite Animation

- Build the home screen.
- Build the daily game interface.
- Implement the seven-question flow.
- Add the 25-second timer.
- Implement the animated kite.
- Connect kite altitude to a mock score initially.
- Make the layout mobile responsive.

Deliverable: A complete playable frontend using mock questions and mock scoring.

### Phase 3 — Core Game Backend

- Implement daily game APIs.
- Implement question retrieval.
- Implement server-side submission handling.
- Add canonical answer matching.
- Add alias matching.
- Add fuzzy matching.
- Implement basic scoring.

Deliverable: A working game using a manually populated question bank.

### Phase 4 — Rarity and Leaderboards

- Implement Bayesian rarity calculations.
- Create rarity snapshots.
- Implement score finalization.
- Add daily leaderboard.
- Add all-time leaderboard.
- Add game archive.

Deliverable: End-to-end playable game with real scoring.

### Phase 5 — AI Answer Validation

- Integrate Groq.
- Implement unseen-answer processing.
- Add BullMQ and Redis.
- Add caching.
- Add validation review queue.
- Add failure handling and retries.

Deliverable: Previously unseen answers can be resolved asynchronously.

### Phase 6 — AI Question Generation

- Generate three candidate questions daily.
- Implement factual validation.
- Implement duplicate detection.
- Store candidates separately.
- Build admin approval interface.
- Add Telegram notifications and approval actions.

Deliverable: A functioning question-generation and approval workflow.

### Phase 7 — Production Readiness

- Add rate limiting.
- Add monitoring and logs.
- Add database backups.
- Test concurrency and duplicate submissions.
- Test worker failures.
- Optimize mobile performance.
- Deploy the application and background worker.

Deliverable: Production-ready MVP.

---

## 15. Instructions for Antigravity

Act as a senior full-stack engineer and technical architect.

Your responsibility is to build this application incrementally while preserving the architecture and product requirements in this document.

### Before writing code

1. Inspect the existing repository and identify its current structure.
2. Check installed dependencies and existing implementation.
3. Identify architectural conflicts with this README.
4. Present the proposed implementation plan.
5. Identify any genuinely unresolved decisions that could materially change the architecture.
6. Ask me about those decisions before proceeding.

Do not ask me questions that this README has already answered.

### While implementing

- Work phase by phase.
- Do not jump ahead to later phases.
- Explain important architectural decisions briefly.
- Keep the code modular and maintainable.
- Prefer simple implementations over unnecessary abstractions.
- Do not introduce microservices.
- Do not introduce embeddings or vector databases in the MVP.
- Do not use an LLM where deterministic logic is sufficient.
- Do not overengineer authentication.
- Do not expose answers or scoring logic to the client.
- Write tests for important backend logic.
- Update this README when actual implementation decisions change.

After each phase:

1. Explain what was implemented.
2. List the important files created or modified.
3. Explain how to run and test it.
4. Report any outstanding issues.
5. Wait for my approval before starting the next phase.

**Start with repository inspection and architecture review. Do not immediately generate the entire application.**

---

## 16. MVP Success Criteria

The first usable version is successful when:

- A player can open the game and enter a nickname.
- Seven daily questions can be played.
- Each question has a 25-second timer.
- The same daily questions are served to all players.
- Valid answers are resolved to canonical entities.
- Rare answers earn more points.
- The kite visibly flies higher as the score increases.
- Final scores are calculated server-side.
- A daily leaderboard is available.
- The game does not depend on Groq being available during normal gameplay.

AI-generated questions, Telegram approval and advanced answer validation can follow once the core game works reliably.

**Build the game first. Automate content creation second.**