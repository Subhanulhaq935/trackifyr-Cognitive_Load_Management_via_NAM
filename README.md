# trackifyr: AI-Based Cognitive Load Estimation via Natural Activity Monitoring

**Final Year Project (FYP)**

trackifyr is an intelligent AI system designed to estimate cognitive load in real-time by analyzing natural user activities during digital work and study sessions. Unlike traditional digital wellbeing tools that only measure screen time, trackifyr uses multimodal behavioral signals (facial expressions, gaze patterns, keyboard, and mouse interactions) to classify cognitive load into three categories: **Low**, **Medium**, and **High**.

---

## 👥 Team Members

| Name | Registration # | Email | Contact |
|------|----------------|-------|---------|
| **Muhammad Moin U Din** (Group Leader) | BCSF22M023 | bcsf22m023@pucit.edu.pk | 0302-8791634 |
| **Muhammad Junaid Malik** | BCSF22M031 | bcsf22m031@pucit.edu.pk | 0326-5869774 |
| **Muhammad Subhan Ul Haq** | BCSF22M043 | bcsf22m043@pucit.edu.pk | 0333-8133811 |

---

## 📋 Project Overview

| Field | Description |
|-------|-------------|
| **FYP Title** | AI-Based Cognitive Load Estimation via Natural Activity Monitoring |
| **Area of Specialization** | Image processing, Computer Vision, Web Development |
| **Nature of Project** | R&D (Research and Development) |
| **Degree** | BS (Hons.) Computer Science |
| **Session** | 2022-2026 |
| **Project Advisor** | Dr. Tayyaba Tariq |
| **Institution** | Department of Computer Science, FCIT, University of the Punjab |

---

## 🎯 Project Goal

Design and develop an AI-based system that estimates cognitive load (Low, Medium, High) in real time using multimodal signals:

- **Facial / head cues** (MediaPipe-based features; temporal deep model v3)
- **Eye gaze–related behavior** and activity proxies from video frames
- **Keyboard typing patterns** (speed, pauses, activity summaries)
- **Mouse interaction** (movement, clicks, interval-based activity)

---

## 🧠 System Overview (Current)

### ✅ Implemented

**Desktop application (Electron)**  
- Windows installer via `electron-builder` (NSIS); Python tracking and models bundled as app resources where configured  
- Session-oriented UX: keyboard/mouse logging and optional webcam pipeline  
- Live fusion path aligned with training feature versions (v1 / v2 / v3) and **ensemble** decision logic  

**Web application (Next.js)**  
- Next.js **16** with React **19**, Tailwind **4**  
- Auth (sign up / sign in / profile), dashboard, reports, tracking setup  
- **Download** page: latest GitHub Release EXE or bundled `public/releases/` assets  
- **API routes** for tracking ingest, sessions, charts, weekly summaries, PDF-oriented reporting (`pg`, `jspdf`)  
- **PostgreSQL** persistence via `DATABASE_URL` (see `trackifyr/.env.example`)  

**Machine learning and signal processing**  
- **DAiSEE**-oriented training and evaluation (`train_daisee.py`, `eval_daisee_test.py`, artifacts under `artifacts/daisee/`)  
- **v1** classical / frame-stat features; **v2** MediaPipe FaceMesh rolling features; **v3** **MobileNetV3-Small + GRU** temporal head in PyTorch  
- **Ensemble** majority vote with tie-break priority (v3 > v2 > v1)  
- **Live demo**: `webcam_cognitive_load.py` (used from desktop and for local experiments)  

**Quality and tooling**  
- Python `unittest` for tracker and webcam/ensemble paths; Node tests for fusion bridge  
- Scripts for desktop release packaging and optional tracking venv setup (`scripts/`)

### 🔄 Remaining / stretch (polish and evaluation)

- Broader user studies and formal evaluation write-up  
- Optional: teacher / cohort dashboards, advanced break-notification policies  
- GPU-specific deployment notes for training (CUDA) vs CPU-only inference  

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|----------------|
| Web | Next.js 16, React 19, Tailwind 4, Recharts |
| Desktop | Electron 34, electron-builder, bundled Python tracking |
| Backend (app) | Next.js Route Handlers, `pg`, bcryptjs |
| ML / CV | Python 3.10+, PyTorch, torchvision, scikit-learn, OpenCV, MediaPipe, NumPy, Pandas, joblib |
| Input | pynput, pyautogui (activity); webcam via OpenCV |
| Data | PostgreSQL |
| Dev | Git / GitHub, ESLint 9, unit tests (Python + Node) |

---

## 📊 Key Resources

| Resource | Notes |
|----------|--------|
| **Datasets** | DAiSEE (primary for training pipeline); literature references include CLT / CLARE where applicable |
| **Version control** | GitHub repository |
| **Documentation** | FYP proposal, literature review, and phase reports (may live outside this repo) |

---

## 📁 Repository Structure

```
trackifyr-Cognitive_Load_Management_via_NAM/
├── trackifyr/                    # Main application (web + shared Python + desktop subproject)
│   ├── app/                      # Next.js App Router (pages, API routes)
│   ├── components/               # React UI components
│   ├── context/                  # React context (e.g. auth)
│   ├── lib/                      # DB pool, shared server utilities
│   ├── desktop/                  # Electron app (trackifyr-desktop, release 1.0.3)
│   ├── ml/                       # Features, models, DAiSEE helpers, ensemble
│   ├── scripts/                  # Desktop packaging, env setup helpers
│   ├── tests/                    # Python (+ Node) tests
│   ├── artifacts/daisee/         # Trained artifacts (paths expected by train/infer scripts)
│   ├── activity_tracker.py       # Mouse / keyboard interval summaries
│   ├── webcam_cognitive_load.py  # Live webcam cognitive load (v1/v2/v3)
│   ├── train_daisee.py           # Training entry points
│   ├── requirements.txt          # Python dependencies
│   └── package.json              # Web scripts; `npm run desktop` / `release:desktop`
├── README.md
└── …
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended for Next.js 16)  
- **Python** 3.10+ for tracking and ML (see `trackifyr/requirements.txt`)  
- **PostgreSQL** for full web auth and tracking persistence  

### Web dashboard

```bash
cd trackifyr
cp .env.example .env          # edit DATABASE_URL for your Postgres user/db
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:3000`).

### Python tracking and ML (local)

```bash
cd trackifyr
py -3 -m pip install -r requirements.txt
# optional: scripts/setup_tracking_env.bat (Windows) or scripts/setup_tracking_env.sh
python activity_tracker.py
python webcam_cognitive_load.py --version v3 --device cuda   # requires trained artifacts
```

### Desktop client (development)

```bash
cd trackifyr
npm run desktop
```

### Desktop release build

From `trackifyr`, use `npm run release:desktop` (see `scripts/package-desktop-release.mjs`) or build from `trackifyr/desktop` with `npm run dist` after installing desktop dependencies.

### End users (Windows)

Use the in-app **Download** flow or the repository **Releases** page for the latest installer (CI/stable name `trackifyr-desktop-setup.exe`, or `trackifyr-Setup-<version>.exe` from a local `desktop` build).

---

## 📈 Project Status

### Done ✅

- ✅ Requirements, architecture, and core documentation trajectory  
- ✅ Activity tracker (mouse / keyboard, interval summaries)  
- ✅ Web dashboard: auth, profile, dashboard, reports, tracking APIs, PostgreSQL integration  
- ✅ DAiSEE-oriented training pipeline and evaluation scripts  
- ✅ MediaPipe-based features, classical and deep temporal model (v3), ensemble fusion  
- ✅ Electron desktop client with bundled tracking/ML layout and versioned releases  
- ✅ Download page wired to latest GitHub Release asset where configured  

### In progress / final polish 🔄

- 🔄 Final FYP report, demos, and evaluation metrics narrative  
- 🔄 Any remaining UX and deployment hardening for evaluators  

---

## 🎓 Success Criteria (mapping)

1. ✅ Categorize cognitive load as **Low / Medium / High** with trained models on DAiSEE-aligned pipelines and ensemble behavior.  
2. ✅ **Real-time** monitoring via desktop client with acceptable latency for lab and daily use.  
3. ✅ **Multimodal** inputs: keyboard, mouse, and optional webcam path into a single fused label for the session UI.  
4. ✅ **Web dashboard** for logs, visualizations, and session reporting.  
5. ✅ Meet supervisor-defined objectives for a practical NAM-based cognitive load tool.  
Dr
---

## 📚 Research Contributions

### Gaps addressed

- Many studies are dataset-only or lab-bound; we target a **usable** stack (desktop + web).  
- We emphasize **natural** activity monitoring rather than intrusive clinical sensors for everyday digital work.  

### Contribution

- **Natural activity monitoring** combining keyboard, mouse, and webcam-derived features.  
- **Real-time detection** with versioned pipelines and explicit ensemble policy.  
- **Actionable product shape**: installable desktop client and authenticated web analytics.  

---

## 📎 Notes for Evaluators

- Changes are traceable via Git history and release tags.  
- Modular layout: `app/api/*` for server behavior, `ml/*` for models/features, `desktop/*` for the Electron shell.  
- For a full run: configure `DATABASE_URL`, install Node and Python deps, and ensure DAiSEE artifacts exist where scripts expect them under `artifacts/daisee/`.  

---

## 📬 Contact

**Project advisor:** Dr. Tayyaba Tariq  
**Group leader:** Muhammad Moin U Din (bcsf22m023@pucit.edu.pk)  

---

## 📄 License

This project is developed as part of the Final Year Project (FYP) at the Department of Computer Science, FCIT, University of the Punjab.

---

**✨ trackifyr** - monitoring cognitive load through natural activity analysis.
