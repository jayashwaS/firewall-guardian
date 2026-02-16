# FIREWALL GUARDIAN: A Cybersecurity Defense Game

## One-Line Pitch
A visually immersive, single-stage browser game where the player is a SOC (Security Operations Center) analyst defending a corporate network from a live cyberattack in real-time.

---

## FULL STORY

### Background
The year is 2026. You are **Alex Chen**, a junior cybersecurity analyst who just joined **NovaTech Industries** - a company that builds medical devices that save thousands of lives. It's your first week on the job.

### The Setup
It's 11:47 PM. You're working the night shift alone at the **Security Operations Center (SOC)**. Your senior analyst, Maya, just left for a coffee break. The room is dim, lit only by the glow of multiple monitors showing network dashboards, traffic graphs, and alert panels.

Suddenly, the threat detection system starts flashing **RED**. A sophisticated hacker group called **"PHANTOM CLAW"** has launched a coordinated attack against NovaTech's network. Their goal: steal patient data from the medical device database and plant ransomware to lock down the entire hospital network.

Maya's phone goes straight to voicemail. You're on your own.

### The Mission
You have **5 minutes** (game clock) to defend the network. Phantom Claw will throw everything at you:

- **Phase 1 - Reconnaissance (0:00 - 1:00):** Port scans and probes hit the firewall. You see suspicious pings and traceroutes. You must identify which traffic is malicious and which is legitimate hospital staff working late.

- **Phase 2 - Initial Access (1:00 - 2:30):** Phishing emails arrive in employee inboxes. SQL injection attempts target the web portal. Brute-force attacks hammer the login page. You must block attack vectors while keeping services running for real users.

- **Phase 3 - Lateral Movement (2:30 - 3:30):** The attackers got a foothold through one compromised endpoint. Malware starts spreading internally. You must isolate infected machines, revoke compromised credentials, and deploy patches.

- **Phase 4 - Data Exfiltration Attempt (3:30 - 4:30):** Phantom Claw tries to extract patient records through encrypted tunnels disguised as normal HTTPS traffic. You must use deep packet inspection to spot the anomalies and block the data leak.

- **Phase 5 - Final Stand (4:30 - 5:00):** Ransomware deployment. The attackers go all-in. Everything hits at once. You must activate the kill switch, restore from backups, and lock down every entry point. The clock is ticking.

### The Outcome
- **WIN:** You stop the attack. Maya returns, sees the logs, and says: "You just saved 50,000 patient records. Not bad for your first week." The screen shows a security report card with your score.
- **LOSE:** The ransomware encrypts the database. A hospital screen flashes "YOUR FILES ARE ENCRYPTED." A message reminds you what you could have done better, with educational tips.

---

## GAME MECHANICS

### Core Gameplay Loop
The player operates a visual SOC dashboard. Threats appear as visual elements on a network map. The player must:

1. **DETECT** - Spot anomalies in the traffic visualizer
2. **ANALYZE** - Click on threats to see details (packet info, IP source, attack type)
3. **DECIDE** - Choose the correct defensive action
4. **ACT** - Apply the defense before the threat reaches the target

### Player Actions (Toolbar)
| Action | Icon | What It Does | Teaches |
|--------|------|-------------|---------|
| Block IP | Shield | Blocks traffic from a source IP | Firewall rules |
| Quarantine | Cage | Isolates an infected machine | Incident response |
| Patch | Wrench | Fixes a vulnerability on a server | Patch management |
| Decrypt & Inspect | Magnifying glass | Deep packet inspection on suspicious traffic | Traffic analysis |
| Revoke Access | Key with X | Revokes compromised user credentials | Access control |
| Backup Restore | Clock rewind | Restores a system from clean backup | Disaster recovery |

### Threat Types (Enemies)
| Threat | Visual | Color | Speed | Damage |
|--------|--------|-------|-------|--------|
| Port Scan | Radar pulse wave | Yellow | Slow | Low |
| Phishing Email | Envelope with skull | Orange | Medium | Medium |
| SQL Injection | Syringe icon | Red | Fast | High |
| Brute Force | Battering ram | Red | Medium | Medium |
| Malware Spread | Virus particles | Purple | Fast | High |
| Data Exfiltration | Leaking pipe | Dark Red | Slow | Critical |
| Ransomware | Padlock with skull | Black/Red | Very Fast | Critical |

### Scoring
- **Correct block:** +100 points + educational popup explaining the attack
- **Missed threat:** -200 points + damage to network health bar
- **False positive (blocking legitimate traffic):** -150 points + service disruption warning
- **Speed bonus:** Extra points for fast response
- **Perfect phase:** Bonus for clearing a phase with no damage

### Network Health Bar
- Starts at 100%
- Each successful attack reduces it
- If it hits 0%, game over (ransomware wins)
- Restoring backups recovers 10% health

---

## VISUAL DESIGN

### Screen Layout
```
+------------------------------------------------------------------+
|  NOVATECH SOC - THREAT LEVEL: [====RED====]    CLOCK: 04:32      |
+------------------------------------------------------------------+
|                          |                                        |
|   NETWORK MAP            |   TRAFFIC VISUALIZER                  |
|                          |                                        |
|   [Cloud]                |   |||||||||||||||||||||||||||          |
|      |                   |   Live scrolling packet stream         |
|   [Firewall]             |   Green = safe, Red = threat           |
|      |                   |   Yellow = suspicious                  |
|   [Router]---[Switch]    |                                        |
|      |    |    |         +----------------------------------------+
|   [Web]  [DB] [Mail]     |   ALERT PANEL                         |
|      |    |    |         |                                        |
|   [PC1] [PC2] [PC3]     |   ! SQL Injection detected on WebSrv   |
|                          |   ! Brute force on LoginPortal         |
|                          |   ! Unusual outbound on DB-Server      |
+------------------------------------------------------------------+
|  TOOLS: [Shield] [Cage] [Wrench] [Magnify] [Key-X] [Rewind]     |
+------------------------------------------------------------------+
|  SCORE: 2,450  |  HEALTH: [========------] 67%  |  PHASE: 3/5   |
+------------------------------------------------------------------+
```

### Visual Effects
- **Network Map:** Isometric or flat-design node graph. Nodes glow green (healthy), yellow (at risk), red (under attack), gray (compromised). Animated pulses travel along connection lines.
- **Traffic Visualizer:** Matrix-style scrolling data. Legitimate traffic in green, suspicious in yellow, malicious in red. Clicking a packet shows decoded info.
- **Attack Animations:** Port scans create ripple effects. Malware spreads as purple tendrils between nodes. Ransomware is a dark wave consuming nodes. Phishing emails float toward mail servers.
- **Defense Animations:** Blocking creates a shield flash. Quarantine drops a cage around a node. Patching shows a wrench spinning. Backup restore plays a rewind effect.
- **Background Ambience:** Dark SOC room with monitor glow. Subtle screen reflections. Blinking server LEDs in background.

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Navy | #0a0e27 |
| Safe/Healthy | Cyber Green | #00ff88 |
| Warning | Amber | #ffaa00 |
| Danger | Crimson | #ff2244 |
| Malware | Purple | #9b30ff |
| UI Panels | Dark Slate | #1a1e3a |
| Text Primary | White | #f0f0f0 |
| Text Secondary | Light Blue | #7ec8e3 |
| Accent/Highlight | Electric Blue | #00b4ff |

---

## EDUCATIONAL LAYER

### Learn-As-You-Play
Every time the player successfully handles a threat, a small **"INTEL BRIEF"** popup appears (2-3 seconds) with a real-world fact:

- *"Port scanning is often the first step in a cyberattack. Tools like Nmap are used to discover open ports and services."*
- *"SQL Injection is ranked #3 on the OWASP Top 10. Always use parameterized queries."*
- *"Phishing accounts for 91% of cyberattacks. Always verify sender addresses."*
- *"Lateral movement means attackers move between systems after gaining initial access. Network segmentation limits this."*
- *"Data exfiltration can be hidden inside normal HTTPS traffic. Deep packet inspection helps detect anomalies."*
- *"Ransomware encrypts files and demands payment. Regular offline backups are your best defense."*
- *"Brute force attacks try thousands of password combinations. Rate limiting and account lockout policies prevent this."*

### Post-Game Report Card
After the game ends (win or lose), the player sees:

```
+------------------------------------------+
|        SECURITY ANALYST REPORT           |
+------------------------------------------+
|  Threats Detected:     23/25             |
|  Correct Responses:    20/23             |
|  False Positives:      1                 |
|  Response Time (avg):  2.3s              |
|  Network Health:       43%               |
|  Final Score:          7,250             |
+------------------------------------------+
|  GRADE: B+                               |
|  RANK: Security Specialist               |
+------------------------------------------+
|                                          |
|  AREAS TO IMPROVE:                       |
|  - Phishing Detection (missed 2)         |
|  - Response Speed in Phase 4             |
|                                          |
|  CONCEPTS LEARNED:                       |
|  [x] Firewall Rules                      |
|  [x] SQL Injection                       |
|  [x] Incident Response                   |
|  [x] Network Segmentation               |
|  [ ] Deep Packet Inspection              |
|  [x] Backup & Recovery                   |
+------------------------------------------+
|  [PLAY AGAIN]    [SHARE SCORE]           |
+------------------------------------------+
```

### Rank System
| Score Range | Rank |
|-------------|------|
| 0 - 2,000 | Intern |
| 2,001 - 4,000 | Junior Analyst |
| 4,001 - 6,000 | Security Analyst |
| 6,001 - 8,000 | Security Specialist |
| 8,001 - 9,500 | Senior Analyst |
| 9,501 - 10,000 | CISO Material |

---

## TECHNICAL IMPLEMENTATION

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Game Engine | **Phaser 3** (HTML5 game framework) |
| Language | **TypeScript** |
| Rendering | **Canvas/WebGL** (via Phaser) |
| UI Overlay | **HTML/CSS** (HUD, panels, popups) |
| Audio | **Howler.js** (ambient sounds, SFX) |
| Bundler | **Vite** |
| Deployment | **Static hosting** (Vercel / Netlify / GitHub Pages) |

### Project Structure
```
firewall-guardian/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       │   ├── network-nodes/       # Server, PC, router sprites
│       │   ├── threats/             # Attack type icons/animations
│       │   ├── tools/               # Toolbar action icons
│       │   ├── effects/             # Shield flash, cage, sparks
│       │   ├── ui/                  # Panel backgrounds, buttons
│       │   └── background/          # SOC room, monitor glow
│       ├── audio/
│       │   ├── ambient-soc.mp3      # Background hum
│       │   ├── alert.mp3            # Threat detected
│       │   ├── block.mp3            # Successful block
│       │   ├── damage.mp3           # Attack hit
│       │   ├── phase-clear.mp3      # Phase completed
│       │   ├── win.mp3              # Victory
│       │   └── lose.mp3             # Game over
│       └── fonts/
│           └── mono-terminal.ttf    # Terminal-style font
├── src/
│   ├── main.ts                      # Entry point, Phaser config
│   ├── config/
│   │   ├── gameConfig.ts            # Game settings, timings
│   │   ├── threatConfig.ts          # Threat definitions
│   │   └── phaseConfig.ts           # Phase definitions & wave data
│   ├── scenes/
│   │   ├── BootScene.ts             # Asset loading
│   │   ├── MenuScene.ts             # Title screen with backstory
│   │   ├── GameScene.ts             # Main gameplay (the single stage)
│   │   ├── HUDScene.ts              # Overlaid HUD (score, health, tools)
│   │   └── ReportScene.ts           # Post-game report card
│   ├── entities/
│   │   ├── NetworkNode.ts           # Server/PC/Router node class
│   │   ├── Threat.ts                # Base threat class
│   │   ├── PortScan.ts              # Port scan behavior
│   │   ├── PhishingEmail.ts         # Phishing behavior
│   │   ├── SQLInjection.ts          # SQL injection behavior
│   │   ├── BruteForce.ts            # Brute force behavior
│   │   ├── Malware.ts               # Malware spread behavior
│   │   ├── DataExfil.ts             # Data exfiltration behavior
│   │   └── Ransomware.ts            # Ransomware behavior
│   ├── systems/
│   │   ├── NetworkManager.ts        # Manages network topology & health
│   │   ├── ThreatSpawner.ts         # Spawns threats per phase schedule
│   │   ├── DefenseManager.ts        # Handles player defensive actions
│   │   ├── TrafficVisualizer.ts     # Scrolling packet stream
│   │   ├── AlertPanel.ts            # Alert log management
│   │   ├── ScoreManager.ts          # Scoring & ranking logic
│   │   └── PhaseManager.ts          # Phase progression & timing
│   ├── ui/
│   │   ├── Toolbar.ts               # Defense tool buttons
│   │   ├── HealthBar.ts             # Network health display
│   │   ├── IntelBrief.ts            # Educational popup system
│   │   ├── PhaseIndicator.ts        # Current phase display
│   │   └── ThreatTooltip.ts         # Hover info on threats
│   └── data/
│       ├── intelBriefs.ts           # Educational text content
│       └── storyDialogue.ts         # Intro/outro narrative text
└── README.md
```

### Key Implementation Details

#### Game Resolution & Responsiveness
- Base resolution: **1280 x 720**
- Scales responsively to fit browser window
- Minimum playable: **1024 x 600**

#### Network Map (Left Panel - 40% width)
- Nodes are interactive sprites placed in a tree topology
- Connections drawn as animated lines (data flowing as dots)
- Click a node to see its status, running services, health
- Threats visually travel along connections toward targets
- Drag a defense tool onto a node/threat to apply it

#### Traffic Visualizer (Right Top - 60% width, 50% height)
- Scrolling columns of packet data (styled like terminal output)
- Each line: `[timestamp] [src_ip] -> [dst_ip] [protocol] [status]`
- Color-coded: green (safe), yellow (suspicious), red (malicious)
- Clickable rows expand to show packet details
- Teaches players to read network logs

#### Alert Panel (Right Bottom - 60% width, 50% height)
- Real-time alert feed
- Severity levels: INFO (blue), WARNING (yellow), CRITICAL (red)
- Clicking an alert highlights the relevant node on the network map
- Unhandled alerts pulse to draw attention

#### Drag-and-Drop Defense
1. Player clicks a tool from the toolbar
2. Cursor changes to that tool's icon
3. Player clicks on a threat or network node
4. If the tool matches the threat type: success animation + score
5. If wrong tool: "Ineffective" feedback + small penalty
6. If applied to clean node: "False positive" warning

#### Phase Progression
- Each phase has a pre-defined wave of threats
- Between phases: brief 3-second "PHASE CLEAR" screen with phase summary
- Difficulty ramps up: more threats, faster speed, more complex attacks
- Phase 5 has overlapping threats from all categories simultaneously

---

## AUDIO DESIGN

| Sound | Description |
|-------|-------------|
| Background | Low hum of servers, quiet keyboard clicks, distant radio chatter |
| Alert Ping | Sharp electronic ping when new threat detected |
| Block Success | Satisfying digital "shield up" sound |
| Quarantine | Metallic cage slam |
| Damage Taken | Glitchy distortion buzz |
| Phase Clear | Ascending synth chime |
| Ransomware Warning | Deep alarm siren |
| Victory | Triumphant synth fanfare |
| Game Over | Descending tones, system shutdown sound |

---

## GAME FLOW (SINGLE STAGE)

```
[TITLE SCREEN]
    "FIREWALL GUARDIAN"
    "Can you stop Phantom Claw?"
    [START MISSION]
         |
         v
[INTRO CUTSCENE - 15 seconds]
    Dark SOC room. Monitors flicker on.
    Text crawl: "11:47 PM. NovaTech Industries..."
    Alert sirens begin. Red lights flash.
    "THREAT DETECTED: PHANTOM CLAW"
    "Defend the network. You're on your own."
         |
         v
[PHASE 1: RECONNAISSANCE] -----> 60 seconds
    Port scans, ping sweeps
    Tutorial hints appear for first-time players
    "TIP: Click the Shield tool, then click on the threat to block it"
         |
         v
[PHASE 2: INITIAL ACCESS] -----> 90 seconds
    Phishing, SQL injection, brute force
    More threats, faster pace
    No more tutorial hints
         |
         v
[PHASE 3: LATERAL MOVEMENT] ----> 60 seconds
    Internal malware spread
    Must quarantine + patch
    Compromised credentials to revoke
         |
         v
[PHASE 4: DATA EXFILTRATION] ---> 60 seconds
    Hidden exfil in HTTPS traffic
    Must use Decrypt & Inspect
    Hardest to detect (looks like normal traffic)
         |
         v
[PHASE 5: FINAL STAND] ---------> 30 seconds
    Everything at once
    Ransomware deployment
    Use Backup Restore if health is low
    Pure chaos - test all skills
         |
         v
[OUTCOME]
    Health > 0% --> VICTORY SCREEN
    Health = 0% --> GAME OVER SCREEN
         |
         v
[REPORT CARD]
    Score, grade, rank
    Concepts learned checklist
    Areas to improve
    [PLAY AGAIN] [SHARE]
```

---

## WHY THIS GAME WORKS

### For the Challenge
- Fast-paced decision-making under pressure
- Score system encourages replayability and competition
- Rank system gives bragging rights
- Wrong decisions are punished (false positives, missed threats)
- Phase 5 is genuinely intense

### For Learning
- Every attack type maps to a real-world threat (OWASP, MITRE ATT&CK)
- Intel Briefs teach without lecturing
- Post-game report shows knowledge gaps
- Players learn SOC analyst workflow organically
- Concepts covered: firewalls, IDS/IPS, incident response, patching, access control, backup/recovery, network segmentation, traffic analysis, phishing awareness

### For Accessibility
- Runs in any modern browser (no install)
- Simple drag-and-drop mechanics (no prior gaming experience needed)
- Color + icon + text for all indicators (colorblind-friendly)
- Keyboard shortcuts for all tools (accessibility)
- Tutorial hints in Phase 1 for beginners

---

## DEVELOPMENT PHASES

### Phase A: Foundation
- Project setup (Vite + Phaser 3 + TypeScript)
- Basic scene structure (Boot, Menu, Game, HUD, Report)
- Network map rendering with static nodes
- Basic threat spawning system

### Phase B: Core Gameplay
- Toolbar with all 6 defense actions
- Drag-and-drop interaction system
- Threat movement along network paths
- Correct/incorrect action matching logic
- Health bar and scoring system

### Phase C: Visuals & Polish
- Node animations (glow, pulse, compromise effects)
- Threat sprites and movement animations
- Defense action visual effects
- Traffic visualizer scrolling display
- Alert panel with real-time feed

### Phase D: Content & Education
- All 5 phases with threat wave data
- Intel Brief popups with real cybersecurity facts
- Intro cutscene / story text
- Post-game report card with grading
- Tutorial hints for Phase 1

### Phase E: Audio & Final Polish
- Background ambient audio
- All sound effects
- Screen shake on critical hits
- Particle effects for blocks/explosions
- Final balancing (threat speed, damage, timing)
- Cross-browser testing
- Mobile responsiveness check

---

## SUMMARY

**Firewall Guardian** is a single-stage, 5-minute cybersecurity defense game that puts players in the seat of a SOC analyst fighting a live cyberattack. Through visual network maps, real-time traffic analysis, and drag-and-drop defense tools, players learn real cybersecurity concepts (firewalls, phishing, SQL injection, malware, ransomware, incident response) while experiencing the intensity of defending critical infrastructure. No prior security knowledge required - the game teaches as you play.

> *"The best way to understand security is to defend against an attack yourself."*
