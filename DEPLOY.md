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

接著，再執行以下 SQL 建立推薦碼系統：

```sql
-- 用戶配額表（推薦碼 & AI 額度）
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES auth.users(id),
  bonus_ai_credits INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own quota" ON user_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quota" ON user_quotas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON user_quotas USING (true) WITH CHECK (true);

-- 產生推薦碼 function
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
  SELECT string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random()*32)::int+1, 1), '')
  FROM generate_series(1, 6);
$$ LANGUAGE sql;

-- 新用戶自動建立配額記錄
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_quotas (user_id, referral_code)
  VALUES (NEW.id, generate_referral_code());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

5. 在 Vercel 加入第四個環境變數 `SUPABASE_SERVICE_ROLE_KEY`（Supabase → Settings → API → service_role secret）

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

## 遇到問題？

- **部署失敗**：回到 Vercel，點 **View Build Logs** 看錯誤訊息，通常是環境變數少填了
- **打開 App 是空白的**：確認 Supabase 的 SQL 有成功執行
- **無法登入**：進 Supabase → Authentication → Settings，確認 Site URL 已改成你的 Vercel 網址
