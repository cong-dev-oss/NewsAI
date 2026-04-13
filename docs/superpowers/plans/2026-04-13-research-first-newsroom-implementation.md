# Research-First Newsroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current crawl/article-centric NewsAI stack with a research-first AI newsroom that ingests signals from NewsData, GNews, and Trading Economics, generates `roundup` and `deep_dive` stories, and manages them through a backend CMS.

**Architecture:** The implementation replaces the current `Source -> Topic -> Config -> Article` model with a dual-layer system: an intelligence layer (`TopicSourceConfig`, `ResearchRun`, `SignalItem`) and a publishing layer (`Story`, `StoryEvidence`, `EditorialNote`). Backend scheduling defaults to `0 2 * * *`, supports `Run now`, and the public site renders published `Story` objects rather than imported source articles.

**Tech Stack:** Next.js 15, React 19, FastAPI, SQLAlchemy, Alembic, Celery, PostgreSQL, TypeScript

---

## File Structure

**Backend models and migrations**
- Modify: `news-aggregator-backend/app/models/article.py`
- Modify: `news-aggregator-backend/app/models/topic.py`
- Delete or stop using: `news-aggregator-backend/app/models/source.py`
- Delete or stop using: `news-aggregator-backend/app/models/config.py`
- Create: `news-aggregator-backend/app/models/signal_source.py`
- Create: `news-aggregator-backend/app/models/topic_source_config.py`
- Create: `news-aggregator-backend/app/models/research_run.py`
- Create: `news-aggregator-backend/app/models/signal_item.py`
- Create: `news-aggregator-backend/app/models/story.py`
- Create: `news-aggregator-backend/app/models/story_evidence.py`
- Create: `news-aggregator-backend/app/models/editorial_note.py`
- Create: `news-aggregator-backend/alembic/versions/<timestamp>_reset_to_research_first_newsroom.py`

**Backend schemas and services**
- Modify: `news-aggregator-backend/app/schemas/job_schema.py`
- Modify: `news-aggregator-backend/app/domain/schemas/article.py`
- Create: `news-aggregator-backend/app/schemas/story_schema.py`
- Create: `news-aggregator-backend/app/schemas/research_schema.py`
- Create: `news-aggregator-backend/app/services/signal_ingestion_service.py`
- Create: `news-aggregator-backend/app/services/signal_scoring_service.py`
- Create: `news-aggregator-backend/app/services/story_generation_service.py`
- Modify: `news-aggregator-backend/app/services/news_api_service.py`

**Backend API and workers**
- Modify: `news-aggregator-backend/app/api/router.py`
- Modify: `news-aggregator-backend/app/api/endpoints/sources.py`
- Modify: `news-aggregator-backend/app/api/v1/articles.py`
- Create: `news-aggregator-backend/app/api/endpoints/stories.py`
- Create: `news-aggregator-backend/app/api/endpoints/research.py`
- Create: `news-aggregator-backend/app/api/endpoints/pipeline.py`
- Modify: `news-aggregator-backend/app/worker/tasks.py`
- Modify: `news-aggregator-backend/app/worker/scheduler.py`

**Frontend admin**
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/dashboard/page.tsx`
- Modify: `app/admin/configs/page.tsx`
- Modify: `app/admin/articles/page.tsx`
- Create: `app/admin/stories/page.tsx`
- Create: `app/admin/research/page.tsx`
- Create: `app/admin/topics/page.tsx`
- Create: `app/admin/pipeline/page.tsx`
- Create: `lib/storyApi.ts`
- Create: `lib/pipelineApi.ts`

**Frontend public**
- Modify: `lib/api.ts`
- Modify: `app/page.tsx`
- Modify: `app/latest/LatestPage.tsx`
- Modify: `app/article/[id]/page.tsx`
- Modify: `components/ArticleCard.tsx`
- Modify: `components/Header.tsx`
- Create: `app/api/stories/route.ts`
- Create: `app/api/stories/[id]/route.ts`
- Create: `app/api/research/route.ts`

## Task 1: Reset the Database Schema to the New Newsroom Model

**Files:**
- Modify: `news-aggregator-backend/app/models/article.py`
- Modify: `news-aggregator-backend/app/models/topic.py`
- Create: `news-aggregator-backend/app/models/signal_source.py`
- Create: `news-aggregator-backend/app/models/topic_source_config.py`
- Create: `news-aggregator-backend/app/models/research_run.py`
- Create: `news-aggregator-backend/app/models/signal_item.py`
- Create: `news-aggregator-backend/app/models/story.py`
- Create: `news-aggregator-backend/app/models/story_evidence.py`
- Create: `news-aggregator-backend/app/models/editorial_note.py`
- Test: `news-aggregator-backend/migrate.py`

- [ ] **Step 1: Write the failing schema expectations in a migration sanity script**

```python
from app.models.topic_source_config import TopicSourceConfig
from app.models.research_run import ResearchRun
from app.models.signal_item import SignalItem
from app.models.story import Story

assert TopicSourceConfig.__tablename__ == "topic_source_configs"
assert ResearchRun.__tablename__ == "research_runs"
assert SignalItem.__tablename__ == "signal_items"
assert Story.__tablename__ == "stories"
```

- [ ] **Step 2: Run the import check to verify it fails before the new models exist**

Run: `.\venv\Scripts\python.exe -c "from app.models.topic_source_config import TopicSourceConfig"`
Expected: `ModuleNotFoundError`

- [ ] **Step 3: Create the new model files with the minimum schema needed**

```python
# news-aggregator-backend/app/models/topic_source_config.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class TopicSourceConfig(Base):
    __tablename__ = "topic_source_configs"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    source_type = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    fetch_limit = Column(Integer, nullable=False, default=20)
    pick_limit = Column(Integer, nullable=False, default=8)
    story_roundup_enabled = Column(Boolean, default=True)
    story_deep_dive_enabled = Column(Boolean, default=True)
    roundup_count = Column(Integer, nullable=False, default=1)
    deep_dive_count = Column(Integer, nullable=False, default=1)
    schedule_cron = Column(String(128), nullable=False, default="0 2 * * *")
    priority_weight = Column(Integer, nullable=False, default=100)
    country = Column(String(16), nullable=True)
    language = Column(String(16), nullable=True)
    category = Column(String(64), nullable=True)
    extra_params = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    topic = relationship("Topic", back_populates="topic_source_configs")
```
```

- [ ] **Step 4: Replace `Article` with the new `Story` model and story lifecycle fields**

```python
# news-aggregator-backend/app/models/story.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    primary_research_run_id = Column(Integer, ForeignKey("research_runs.id"), nullable=True)
    story_type = Column(String(32), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="draft", index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    deck = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    hero_image = Column(String(512), nullable=True)
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 5: Add a destructive Alembic migration that drops old business tables and creates the new ones**

```python
def upgrade() -> None:
    op.drop_table("articles")
    op.drop_table("sources")
    op.drop_table("source_topic_configs")
    op.create_table("topic_source_configs", ...)
    op.create_table("research_runs", ...)
    op.create_table("signal_items", ...)
    op.create_table("stories", ...)
    op.create_table("story_evidences", ...)
    op.create_table("editorial_notes", ...)
```

- [ ] **Step 6: Run the import check again to verify the schema layer exists**

Run: `.\venv\Scripts\python.exe -c "from app.models.topic_source_config import TopicSourceConfig; from app.models.story import Story; print('ok')"`
Expected: `ok`

- [ ] **Step 7: Commit**

```bash
git add news-aggregator-backend/app/models news-aggregator-backend/alembic/versions
git commit -m "refactor: reset schema for research-first newsroom"
```

## Task 2: Replace Crawl Jobs with Research Signal Ingestion

**Files:**
- Modify: `news-aggregator-backend/app/services/news_api_service.py`
- Create: `news-aggregator-backend/app/services/signal_ingestion_service.py`
- Create: `news-aggregator-backend/app/services/signal_scoring_service.py`
- Modify: `news-aggregator-backend/app/worker/tasks.py`
- Test: `news-aggregator-backend/test_task.py`

- [ ] **Step 1: Write a failing ingestion test stub for normalized signal output**

```python
from app.services.signal_ingestion_service import SignalIngestionService

signals = SignalIngestionService.normalize_items(
    source_type="newsdata",
    topic_name="Kinh tế",
    items=[{"title": "GDP tăng", "content": "Tăng trưởng mạnh", "url": "https://a"}],
)

assert signals[0]["title"] == "GDP tăng"
assert signals[0]["source_type"] == "newsdata"
assert signals[0]["topic_name"] == "Kinh tế"
```

- [ ] **Step 2: Run the targeted import check and verify it fails**

Run: `.\venv\Scripts\python.exe -c "from app.services.signal_ingestion_service import SignalIngestionService"`
Expected: `ModuleNotFoundError`

- [ ] **Step 3: Implement normalized ingestion and source-specific adapters**

```python
# news-aggregator-backend/app/services/signal_ingestion_service.py
class SignalIngestionService:
    @staticmethod
    def normalize_items(source_type: str, topic_name: str, items: list[dict]) -> list[dict]:
        normalized = []
        for item in items:
            normalized.append({
                "source_type": source_type,
                "topic_name": topic_name,
                "title": item.get("title", "").strip(),
                "excerpt": item.get("description", "") or item.get("content", ""),
                "original_url": item.get("url", ""),
                "published_at": item.get("published_at"),
                "raw_payload": item,
            })
        return normalized
```

- [ ] **Step 4: Add signal scoring that uses freshness, relevance, source weight, and diversity**

```python
# news-aggregator-backend/app/services/signal_scoring_service.py
class SignalScoringService:
    @staticmethod
    def score_signal(signal: dict, priority_weight: int) -> int:
        base = priority_weight
        if signal.get("title"):
            base += 20
        if signal.get("excerpt"):
            base += 10
        return base
```

- [ ] **Step 5: Rewrite the worker task to create `ResearchRun` and `SignalItem` instead of `Article`**

```python
@celery_app.task(bind=True)
def run_topic_source_research(self, topic_source_config_id: int):
    db = SessionLocal()
    run = ResearchRun(topic_source_config_id=topic_source_config_id, trigger_mode="scheduled", status="running")
    db.add(run)
    db.commit()
```

- [ ] **Step 6: Run the import and worker sanity checks**

Run: `.\venv\Scripts\python.exe test_task.py`
Expected: exits without `ImportError`

- [ ] **Step 7: Commit**

```bash
git add news-aggregator-backend/app/services news-aggregator-backend/app/worker news-aggregator-backend/test_task.py
git commit -m "feat: ingest and score newsroom research signals"
```

## Task 3: Add AI Story Generation and Evidence Linking

**Files:**
- Create: `news-aggregator-backend/app/services/story_generation_service.py`
- Modify: `news-aggregator-backend/app/services/ai_service.py`
- Modify: `news-aggregator-backend/app/worker/tasks.py`
- Test: `news-aggregator-backend/test_task.py`

- [ ] **Step 1: Write the failing story payload expectation**

```python
from app.services.story_generation_service import StoryGenerationService

payload = StoryGenerationService.build_story_payload(
    topic_name="Kinh tế",
    story_type="roundup",
    top_signals=[{"title": "GDP tăng", "excerpt": "Tăng trưởng mạnh"}],
)

assert payload["story_type"] == "roundup"
assert "GDP tăng" in payload["prompt"]
```

- [ ] **Step 2: Run the import check and verify it fails**

Run: `.\venv\Scripts\python.exe -c "from app.services.story_generation_service import StoryGenerationService"`
Expected: `ModuleNotFoundError`

- [ ] **Step 3: Implement story prompt building and AI output shaping**

```python
# news-aggregator-backend/app/services/story_generation_service.py
class StoryGenerationService:
    @staticmethod
    def build_story_payload(topic_name: str, story_type: str, top_signals: list[dict]) -> dict:
        lines = "\n".join(f"- {item['title']}: {item['excerpt']}" for item in top_signals)
        return {
            "story_type": story_type,
            "prompt": f"Write a {story_type} story for {topic_name} using:\n{lines}",
        }
```

- [ ] **Step 4: Extend the worker to create `Story` and `StoryEvidence` records**

```python
story = Story(
    topic_id=config.topic_id,
    primary_research_run_id=run.id,
    story_type="roundup",
    status="draft",
    title=generated_title,
    slug=generated_slug,
    summary=generated_summary,
    body=generated_body,
)
db.add(story)
db.commit()
```

- [ ] **Step 5: Run the story generation sanity script**

Run: `.\venv\Scripts\python.exe test_task.py`
Expected: exits without `ImportError`

- [ ] **Step 6: Commit**

```bash
git add news-aggregator-backend/app/services/story_generation_service.py news-aggregator-backend/app/worker/tasks.py
git commit -m "feat: generate newsroom stories from research runs"
```

## Task 4: Replace Backend APIs with Story, Research, and Pipeline Endpoints

**Files:**
- Create: `news-aggregator-backend/app/api/endpoints/stories.py`
- Create: `news-aggregator-backend/app/api/endpoints/research.py`
- Create: `news-aggregator-backend/app/api/endpoints/pipeline.py`
- Modify: `news-aggregator-backend/app/api/router.py`
- Modify: `news-aggregator-backend/app/api/v1/articles.py`
- Modify: `news-aggregator-backend/app/api/endpoints/sources.py`
- Test: `news-aggregator-backend/app/main.py`

- [ ] **Step 1: Write the failing route expectations**

```python
from app.api.router import api_router

paths = [route.path for route in api_router.routes]
assert "/stories" in "".join(paths)
assert "/research" in "".join(paths)
assert "/pipeline" in "".join(paths)
```

- [ ] **Step 2: Run the route inspection and verify it fails before the new routers are mounted**

Run: `.\venv\Scripts\python.exe -c "from app.api.router import api_router; print([route.path for route in api_router.routes])"`
Expected: no `stories`, `research`, or `pipeline` routes

- [ ] **Step 3: Implement `stories` endpoints for listing, reading, reviewing, and publishing**

```python
router = APIRouter(prefix="/stories", tags=["stories"])

@router.get("/")
def list_stories(...):
    ...

@router.post("/{story_id}/publish")
def publish_story(story_id: int, ...):
    ...
```

- [ ] **Step 4: Implement `research` endpoints for run history and signal inspection**

```python
router = APIRouter(prefix="/research", tags=["research"])

@router.get("/runs")
def list_runs(...):
    ...

@router.get("/runs/{run_id}")
def get_run(run_id: int, ...):
    ...
```

- [ ] **Step 5: Implement `pipeline` endpoints for `TopicSourceConfig` CRUD and `Run now`**

```python
router = APIRouter(prefix="/pipeline", tags=["pipeline"])

@router.post("/run-now")
def run_now(payload: PipelineRunNowRequest, ...):
    ...
```

- [ ] **Step 6: Mount the new routers and stop exposing the old article/source semantics as primary workflows**

Run: `.\venv\Scripts\python.exe -c "from app.main import app; print('ok')"`
Expected: `ok`

- [ ] **Step 7: Commit**

```bash
git add news-aggregator-backend/app/api
git commit -m "refactor: expose research-first newsroom APIs"
```

## Task 5: Replace the Admin Menu and Screens with Newsroom Workflows

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/dashboard/page.tsx`
- Modify: `app/admin/configs/page.tsx`
- Modify: `app/admin/articles/page.tsx`
- Create: `app/admin/stories/page.tsx`
- Create: `app/admin/research/page.tsx`
- Create: `app/admin/topics/page.tsx`
- Create: `app/admin/pipeline/page.tsx`
- Create: `lib/storyApi.ts`
- Create: `lib/pipelineApi.ts`
- Test: `node_modules\\.bin\\tsc.cmd --noEmit`

- [ ] **Step 1: Write the failing menu expectation**

```typescript
const menuItems = [
  "Dashboard",
  "Stories",
  "Research",
  "Topics",
  "Pipeline",
  "Settings",
];

if (menuItems.length !== 6) {
  throw new Error("Admin menu is incomplete");
}
```

- [ ] **Step 2: Verify the current layout still exposes the old menu**

Run: `rg -n "Articles|Settings|Dashboard" app/admin/layout.tsx`
Expected: only the old `Dashboard`, `Settings`, `Articles` items are present

- [ ] **Step 3: Replace the admin navigation with the newsroom menu**

```tsx
const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Stories", path: "/admin/stories" },
  { name: "Research", path: "/admin/research" },
  { name: "Topics", path: "/admin/topics" },
  { name: "Pipeline", path: "/admin/pipeline" },
  { name: "Settings", path: "/admin/settings" },
];
```

- [ ] **Step 4: Split old configuration concerns into `Topics`, `Pipeline`, and `Stories` pages**

```tsx
// app/admin/pipeline/page.tsx
export default function PipelinePage() {
  return <div>Pipeline configs by source + topic</div>;
}
```

- [ ] **Step 5: Add API clients for stories and pipeline screens**

```typescript
export const storyApi = {
  list: () => fetch("/api/stories").then((res) => res.json()),
  publish: (id: number) => fetch(`/api/stories/${id}/publish`, { method: "POST" }).then((res) => res.json()),
};
```

- [ ] **Step 6: Run the typecheck to verify the admin refactor compiles**

Run: `node_modules\\.bin\\tsc.cmd --noEmit`
Expected: exit code `0`

- [ ] **Step 7: Commit**

```bash
git add app/admin lib/storyApi.ts lib/pipelineApi.ts
git commit -m "feat: replace admin with newsroom cms workflows"
```

## Task 6: Switch Public Pages from Imported Articles to Published Stories

**Files:**
- Modify: `lib/api.ts`
- Modify: `app/page.tsx`
- Modify: `app/latest/LatestPage.tsx`
- Modify: `app/article/[id]/page.tsx`
- Modify: `components/ArticleCard.tsx`
- Modify: `components/Header.tsx`
- Create: `app/api/stories/route.ts`
- Create: `app/api/stories/[id]/route.ts`
- Test: `node_modules\\.bin\\tsc.cmd --noEmit`

- [ ] **Step 1: Write the failing public API expectation**

```typescript
const expectedEndpoint = "/api/stories";
if (!expectedEndpoint.includes("stories")) {
  throw new Error("Public content endpoint not switched");
}
```

- [ ] **Step 2: Verify the current public data layer still references `articles`**

Run: `rg -n "articles" lib/api.ts app/page.tsx app/latest app/article components/ArticleCard.tsx`
Expected: multiple references to `articles`

- [ ] **Step 3: Replace `getArticles` and `getArticleById` with story-oriented functions**

```typescript
export const getStories = async (limit = 10, topic?: string, storyType?: string) => {
  const url = new URL("/api/stories", "http://localhost");
  url.searchParams.set("limit", String(limit));
  if (topic) url.searchParams.set("topic", topic);
  if (storyType) url.searchParams.set("story_type", storyType);
  return fetch(url.pathname + url.search, { cache: "no-store" }).then((res) => res.json());
};
```

- [ ] **Step 4: Update homepage and article detail pages to render published `Story` fields**

```tsx
const spotlightStories = await getStories(4, undefined, "roundup");
```

- [ ] **Step 5: Update the header category/topic links to use editorial topics**

```tsx
const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Latest", href: "/latest" },
];
```

- [ ] **Step 6: Run the typecheck again**

Run: `node_modules\\.bin\\tsc.cmd --noEmit`
Expected: exit code `0`

- [ ] **Step 7: Commit**

```bash
git add lib/api.ts app components app/api/stories
git commit -m "refactor: render published newsroom stories on public site"
```

## Task 7: Add Scheduler Defaults and Manual Run Controls

**Files:**
- Modify: `news-aggregator-backend/app/worker/scheduler.py`
- Modify: `news-aggregator-backend/app/worker/tasks.py`
- Modify: `app/admin/pipeline/page.tsx`
- Test: `news-aggregator-backend/test_task.py`

- [ ] **Step 1: Write the failing default schedule expectation**

```python
default_cron = "0 2 * * *"
assert default_cron == "0 2 * * *"
```

- [ ] **Step 2: Verify the scheduler still uses the old config model**

Run: `rg -n "SourceTopicConfig|crawl_job|cron_config" news-aggregator-backend/app/worker`
Expected: old model references are still present

- [ ] **Step 3: Update scheduler sync to operate on `TopicSourceConfig`**

```python
task_name = f"research_run_{config.id}"
```

- [ ] **Step 4: Add `run now` support for all pipelines, one topic, or one source+topic pair**

```python
def trigger_manual_run(config_ids: list[int]) -> dict:
    for config_id in config_ids:
        run_topic_source_research.delay(config_id)
    return {"status": "success", "triggered_count": len(config_ids)}
```

- [ ] **Step 5: Expose the controls in the admin pipeline screen**

```tsx
<button onClick={() => runNow(config.id)}>Run now</button>
```

- [ ] **Step 6: Run the worker sanity check**

Run: `.\venv\Scripts\python.exe test_task.py`
Expected: exits without `ImportError`

- [ ] **Step 7: Commit**

```bash
git add news-aggregator-backend/app/worker app/admin/pipeline/page.tsx
git commit -m "feat: add default 2am scheduler and manual pipeline runs"
```

## Task 8: Final Verification and Cleanup

**Files:**
- Modify: `README.md`
- Test: `npm.cmd test`
- Test: `node_modules\\.bin\\tsc.cmd --noEmit`
- Test: `.\venv\Scripts\python.exe -c "from app.main import app; print('ok')"`

- [ ] **Step 1: Update the README to reflect the research-first newsroom architecture**

```md
- Primary sources: NewsData, GNews, Trading Economics
- Primary content objects: Stories
- Default scheduler: 02:00 daily
```

- [ ] **Step 2: Run the frontend tests**

Run: `npm.cmd test`
Expected: all tests pass

- [ ] **Step 3: Run the frontend typecheck**

Run: `node_modules\\.bin\\tsc.cmd --noEmit`
Expected: exit code `0`

- [ ] **Step 4: Run the backend import sanity check**

Run: `.\venv\Scripts\python.exe -c "from app.main import app; print('ok')"`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update newsroom architecture and operations"
```
