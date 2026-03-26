# Brainworm 部署說明

> 給完全不懂技術的人看的部署步驟，大約 10 分鐘可以完成。

---

## 第一步：準備好三個金鑰

部署前，請先確認你有以下三個值（可在 Supabase 和 Google AI Studio 找到）：

| 變數名稱 | 說明 | 在哪裡找 |
|---|---|---|
| `GEMINI_API_KEY` | Google AI 金鑰 | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `NEXT_PUBLIC_SUPABASE_URL` | 資料庫網址 | Supabase 專案 → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 資料庫公開金鑰 | Supabase 專案 → Settings → API → anon public |

---

## 第二步：在 Supabase 建立資料表

1. 進入你的 [Supabase](https://supabase.com) 專案
2. 點左側選單的 **SQL Editor**
3. 把以下 SQL 全部複製貼上，然後點 **Run**

```sql
-- 建立 cards 資料表（收件匣）
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text,
  type_label text,
  title text,
  summary text,
  url text,
  tag text,
  status text default 'processing',
  created_at timestamptz default now()
);

-- 建立 themes 資料表（主題）
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  emoji text,
  name text,
  color text,
  created_at timestamptz default now()
);

-- 建立 chat_summaries 資料表（對話摘要）
create table if not exists chat_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  summary text,
  theme_id uuid references themes(id) on delete set null,
  created_at timestamptz default now()
);

-- 開啟 Row Level Security（讓每個用戶只能看自己的資料）
alter table cards enable row level security;
alter table themes enable row level security;
alter table chat_summaries enable row level security;

-- cards 的存取規則
create policy "用戶只能存取自己的 cards" on cards
  for all using (auth.uid() = user_id);

-- themes 的存取規則
create policy "用戶只能存取自己的 themes" on themes
  for all using (auth.uid() = user_id);

-- chat_summaries 的存取規則
create policy "用戶只能存取自己的 chat_summaries" on chat_summaries
  for all using (auth.uid() = user_id);
```

4. 看到 **Success** 就完成了

---

## 第三步：部署到 Vercel

### 3-1 登入 Vercel

1. 打開瀏覽器，前往 **[vercel.com](https://vercel.com)**
2. 點右上角 **Sign Up** 或 **Log In**
3. 選擇 **Continue with GitHub**（用你的 GitHub 帳號登入）

### 3-2 匯入專案

1. 登入後，點畫面中的 **Add New Project**（或 **New Project**）
2. 在左側找到 **brainworm**，點旁邊的 **Import**

### 3-3 設定環境變數

> 這步很重要！少一個 App 就會壞掉。

在 **Configure Project** 頁面，往下捲到 **Environment Variables** 區塊：

1. 在 **Name** 欄位填入 `GEMINI_API_KEY`，在 **Value** 欄位貼上你的 Gemini 金鑰 → 點 **Add**
2. 在 **Name** 欄位填入 `NEXT_PUBLIC_SUPABASE_URL`，在 **Value** 欄位貼上 Supabase URL → 點 **Add**
3. 在 **Name** 欄位填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，在 **Value** 欄位貼上 Supabase Anon Key → 點 **Add**

確認三個變數都加好後，點 **Deploy**。

### 3-4 等待部署完成

Vercel 會自動幫你建置，大約等 **1～2 分鐘**。

看到 **Congratulations!** 或綠色勾勾就成功了！

點 **Visit** 就可以打開你的 App。

---

## 之後怎麼更新？

之後只要把程式碼推到 GitHub（`git push`），Vercel 就會自動重新部署，不需要再手動操作。

---

## 第四步：啟用 Google / Facebook 登入（選用）

如果你想讓用戶用 Google 或 Facebook 帳號登入，需要額外設定：

### 4-1 設定 Supabase Redirect URL

1. 進入 [Supabase](https://supabase.com) → 你的專案 → **Authentication** → **URL Configuration**
2. 在 **Redirect URLs** 加入：`https://你的domain.vercel.app/auth/callback`

### 4-2 啟用 Google 登入

**先在 Google Cloud Console 建立 OAuth 憑證：**

1. 前往 [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. 點 **Create Credentials** → **OAuth client ID**
3. Application type 選 **Web application**
4. 在 **Authorized redirect URIs** 加入 Supabase 提供的回調網址（格式：`https://你的專案ID.supabase.co/auth/v1/callback`）
5. 建立後複製 **Client ID** 和 **Client Secret**

**在 Supabase 啟用：**

1. 進入 Supabase → **Authentication** → **Providers** → 找到 **Google** 點開
2. 開啟 **Enable Sign in with Google**
3. 填入剛才的 **Client ID** 和 **Client Secret**
4. 點 **Save**

### 4-3 啟用 Facebook 登入

**先在 Meta Developer 建立應用程式：**

1. 前往 [Meta for Developers](https://developers.facebook.com) → **My Apps** → **Create App**
2. 選擇 **Consumer** 類型
3. 在應用程式設定中，前往 **Facebook Login** → **Settings**
4. 在 **Valid OAuth Redirect URIs** 加入：`https://你的專案ID.supabase.co/auth/v1/callback`
5. 複製左側選單的 **App ID** 和 **App Secret**

**在 Supabase 啟用：**

1. 進入 Supabase → **Authentication** → **Providers** → 找到 **Facebook** 點開
2. 開啟 **Enable Sign in with Facebook**
3. 填入 **App ID** 和 **App Secret**
4. 點 **Save**

---

## 遇到問題？

- **部署失敗**：回到 Vercel，點 **View Build Logs** 看錯誤訊息，通常是環境變數少填了
- **打開 App 是空白的**：確認 Supabase 的 SQL 有成功執行
- **無法登入**：進 Supabase → Authentication → Settings，確認 Site URL 已改成你的 Vercel 網址
- **OAuth 登入失敗（oauth_failed）**：確認 Redirect URL 設定正確，且 Provider 已在 Supabase 啟用
