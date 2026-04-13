# Research-First Newsroom Design

**Date:** 2026-04-13

## Goal

Tái cấu trúc NewsAI từ mô hình crawl/tổng hợp bài ngoài sang mô hình newsroom AI `research-first`, trong đó dữ liệu từ `NewsData.io`, `GNews`, và `Trading Economics` chỉ là tín hiệu đầu vào; sản phẩm chính của hệ thống là bài viết do AI tạo và được quản lý như một CMS biên tập.

## Product Direction

- Hệ thống mới không coi bài nguồn ngoài là article chính.
- Hệ thống lấy dữ liệu research từ API, chuẩn hóa thành tín hiệu.
- AI tạo hai loại bài:
  - `Roundup`: bản tin tổng hợp
  - `Deep Dive`: bài phân tích sâu
- Bài viết đi qua lifecycle:
  - `draft`
  - `reviewed`
  - `published`

## Core Architecture

### 1. Intelligence Layer

Lớp này chịu trách nhiệm thu thập, chuẩn hóa, chấm điểm, và lưu tín hiệu đầu vào.

Nguồn nghiên cứu chính:
- `NewsData.io`
- `GNews`
- `Trading Economics`

Trách nhiệm:
- gọi API theo cấu hình `nguồn + chủ đề`
- chuẩn hóa kết quả về một schema chung
- loại trùng
- chấm điểm mức độ tiêu biểu
- lưu lịch sử mỗi lần chạy vào `ResearchRun`

### 2. Publishing Layer

Lớp này nhận dữ liệu từ research và tạo nội dung xuất bản.

Trách nhiệm:
- tạo AI prompt theo topic và story type
- sinh bài `Roundup` và `Deep Dive`
- lưu bài dưới dạng `Story`
- cho phép admin duyệt, chỉnh sửa, xuất bản
- giữ liên kết bài viết với các tín hiệu gốc để truy vết

## Data Model

### Topic

Chủ đề biên tập chính của hệ thống, ví dụ:
- `Chính trị`
- `Kinh tế`
- `Công nghệ`
- `Thị trường`
- `Vĩ mô`

Mục đích:
- phân loại research
- phân loại story
- là trục cấu hình chính của pipeline

### SignalSource

Nguồn research của hệ thống.

Giá trị mặc định:
- `newsdata`
- `gnews`
- `trading_economics`

Mục đích:
- mô tả nguồn gốc của tín hiệu
- cho phép bật/tắt nguồn trong backend

### TopicSourceConfig

Đơn vị cấu hình vận hành chính của hệ thống, theo cặp `nguồn + chủ đề`.

Trường đề xuất:
- `id`
- `topic_id`
- `source_type`
- `is_active`
- `fetch_limit`
- `pick_limit`
- `story_roundup_enabled`
- `story_deep_dive_enabled`
- `roundup_count`
- `deep_dive_count`
- `schedule_cron`
- `priority_weight`
- `country`
- `language`
- `category`
- `extra_params`
- `created_at`
- `updated_at`

Ý nghĩa:
- quyết định mỗi nguồn sẽ lấy bao nhiêu tín hiệu cho mỗi chủ đề
- quyết định lịch chạy
- quyết định có tạo roundup hay deep dive hay không
- quyết định trọng số khi chấm điểm tín hiệu

Mặc định:
- `schedule_cron = "0 2 * * *"`
- chạy `1 lần/ngày` lúc `02:00`

### ResearchRun

Một lần chạy research cho một cấu hình `nguồn + chủ đề`.

Trường đề xuất:
- `id`
- `topic_source_config_id`
- `trigger_mode` (`scheduled`, `manual`)
- `status` (`queued`, `running`, `completed`, `failed`)
- `started_at`
- `finished_at`
- `raw_count`
- `selected_count`
- `summary`
- `error_message`

Mục đích:
- lưu lịch sử pipeline
- phục vụ audit và dashboard

### SignalItem

Mỗi tín hiệu đầu vào sau khi được chuẩn hóa.

Trường đề xuất:
- `id`
- `research_run_id`
- `topic_id`
- `source_type`
- `source_name`
- `title`
- `excerpt`
- `original_url`
- `published_at`
- `language`
- `country`
- `signal_score`
- `tags`
- `raw_payload`
- `created_at`

Mục đích:
- lưu evidence đầu vào
- hỗ trợ xếp hạng tín hiệu nổi bật

### Story

Bài viết AI do hệ thống tạo.

Trường đề xuất:
- `id`
- `topic_id`
- `primary_research_run_id`
- `story_type` (`roundup`, `deep_dive`)
- `status` (`draft`, `reviewed`, `published`)
- `title`
- `slug`
- `deck`
- `summary`
- `body`
- `hero_image`
- `seo_title`
- `seo_description`
- `published_at`
- `created_at`
- `updated_at`

Mục đích:
- là content object chính của sản phẩm

### StoryEvidence

Bảng nối giữa `Story` và `SignalItem`.

Trường đề xuất:
- `id`
- `story_id`
- `signal_item_id`

Mục đích:
- truy vết bài viết được tạo dựa trên tín hiệu nào

### EditorialNote

Ghi chú biên tập cho bài viết.

Trường đề xuất:
- `id`
- `story_id`
- `note`
- `created_at`
- `created_by`

Mục đích:
- hỗ trợ review workflow

## Tables To Remove Or Replace

Các bảng và logic cũ không còn phù hợp:
- `sources`
- `source_topic_configs`
- `articles` theo nghĩa bài kéo từ nguồn ngoài
- toàn bộ luồng `crawl_job`

Các thực thể này sẽ được thay bằng:
- `SignalSource`
- `TopicSourceConfig`
- `ResearchRun`
- `SignalItem`
- `Story`

## Backend Workflow

### Scheduled Run

1. Scheduler chọn `TopicSourceConfig` đang active.
2. Chạy theo cron mặc định `0 2 * * *`, hoặc lịch đã cấu hình riêng.
3. Tạo `ResearchRun` mới với `trigger_mode = scheduled`.
4. Gọi nguồn API tương ứng.
5. Chuẩn hóa và chấm điểm tín hiệu.
6. Chọn `pick_limit` tín hiệu tốt nhất.
7. Tạo `Roundup` và/hoặc `Deep Dive` theo config.
8. Lưu `StoryEvidence`.
9. Cập nhật trạng thái run.

### Manual Run

Admin có thể kích hoạt thủ công từ backend theo 3 mức:
- toàn bộ pipeline
- một `topic`
- một `nguồn + chủ đề`

Mỗi lần chạy thủ công:
- tạo `ResearchRun` mới
- có `trigger_mode = manual`
- không ghi đè lịch sử cũ

## Signal Scoring Logic

Mục tiêu là chọn ra các bài tiêu biểu, đánh giá cao nhất.

Điểm tín hiệu nên tính từ:
- độ mới
- mức độ liên quan chủ đề
- độ uy tín nguồn
- trọng số cấu hình của nguồn
- mức độ khác biệt so với các tín hiệu còn lại

`Trading Economics` được dùng như nguồn evidence tin cậy cho:
- chỉ số kinh tế vĩ mô
- thay đổi chính sách
- dữ liệu bổ trợ cho `Deep Dive`

## Story Generation Rules

### Roundup

Đặc điểm:
- ngắn hơn
- tóm tắt diễn biến nổi bật
- phù hợp trang chủ và cập nhật nhanh

Nguồn dữ liệu:
- các `SignalItem` điểm cao nhất trong một `ResearchRun`

### Deep Dive

Đặc điểm:
- dài hơn
- có bối cảnh, tác động, diễn giải
- phù hợp bài phân tích chủ đề

Nguồn dữ liệu:
- `SignalItem` nổi bật
- tín hiệu kinh tế/chính sách từ `Trading Economics`

## Admin Menu

Menu backend mới:
- `Dashboard`
- `Stories`
- `Research`
- `Topics`
- `Pipeline`
- `Settings`

### Dashboard

Hiển thị:
- tổng số run hôm nay
- số draft
- số published
- chủ đề nóng
- trạng thái pipeline

### Stories

Hiển thị:
- danh sách bài AI
- lọc theo `topic`, `story_type`, `status`, `research_run`, `source`
- thao tác sửa, duyệt, xuất bản

### Research

Hiển thị:
- danh sách `ResearchRun`
- số lượng tín hiệu thu được
- tín hiệu nổi bật nhất
- bài đã được tạo từ run đó

### Topics

Quản lý:
- danh sách chủ đề biên tập

### Pipeline

Quản lý:
- cấu hình `nguồn + chủ đề`
- `fetch_limit`
- `pick_limit`
- số lượng `roundup`
- số lượng `deep_dive`
- lịch chạy
- bật/tắt pipeline
- chạy thủ công `Run now`

### Settings

Quản lý:
- API keys
- model AI
- prompt templates
- branding
- SEO mặc định

## Homepage And Public Content Logic

Trang public sẽ hiển thị `Story` đã xuất bản, không hiển thị `SignalItem`.

Trang chủ sẽ lấy dữ liệu từ:
- `Story` published loại `roundup` cho các khối cập nhật nhanh
- `Story` published loại `deep_dive` cho khối phân tích sâu

Thuật ngữ public:
- `Spotlight`
- `Radar`
- `Latest`
- `Topics`

## Scheduling Defaults

Mặc định mọi `TopicSourceConfig` mới:
- active
- chạy `1 lần/ngày`
- lúc `02:00`

Admin có thể:
- đổi cron
- bật/tắt pipeline
- chạy thủ công từ backend

## Database Reset Strategy

Người dùng yêu cầu xóa toàn bộ database cũ và cấu trúc hóa lại dữ liệu.

Chiến lược:
- reset dữ liệu nghiệp vụ cũ
- tạo schema mới theo newsroom model
- không giữ logic tương thích ngược với hệ thống crawl cũ

Điều này cho phép:
- bỏ hẳn các giả định cũ về crawl URL
- giữ backend, menu, và UI đồng nhất với mô hình mới

## Risks And Constraints

- Thay đổi này là refactor lớn, không phải chỉnh sửa nhỏ.
- Cần thay cả backend models, scheduler, worker, API, và admin UI.
- Các route hiện tại đang phục vụ `Article` sẽ phải đổi sang `Story`.
- Dữ liệu cũ sẽ không còn ý nghĩa trong schema mới và được phép loại bỏ.

## Acceptance Criteria

- Hệ thống không còn lấy bài ngoài làm article chính.
- Nguồn research chính là `NewsData.io`, `GNews`, `Trading Economics`.
- Có cấu hình theo `nguồn + chủ đề`.
- Mặc định lịch chạy là `02:00` mỗi ngày.
- Có thể `Run now` từ backend.
- Có hai loại nội dung: `Roundup` và `Deep Dive`.
- Public site hiển thị `Story` đã publish.
- Admin backend có menu mới: `Dashboard`, `Stories`, `Research`, `Topics`, `Pipeline`, `Settings`.
