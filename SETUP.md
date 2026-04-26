# LiveHushh — Production Setup Guide

Everything you need to go from local files to a live app on **www.livehushh.com**.

---

## Architecture

```
Browser (HTML/CSS/JS)
  └─► AWS Amplify Hosting  (your domain)
  └─► Amazon Cognito        (sign-up / sign-in)
  └─► API Gateway + Lambda  (REST API)
        └─► MongoDB Atlas    (database)
```

---

## Step 1 — Prerequisites

```bash
# Install Node (already done — v25.9.0)
node -v

# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Verify
amplify --version
```

---

## Step 2 — Configure AWS credentials

```bash
amplify configure
```

This opens the AWS Console. Create an IAM user with **AdministratorAccess**, then paste the Access Key ID and Secret into the CLI prompt.

---

## Step 3 — Initialise Amplify in this project

Run from `C:\Users\punit\OneDrive\Desktop\LH`:

```bash
amplify init
```

Answers to use:
| Prompt | Answer |
|---|---|
| Project name | `livehushh` |
| Environment name | `prod` |
| Default editor | Your editor |
| App type | `javascript` |
| Framework | `none` |
| Source dir | `.` |
| Distribution dir | `.` |
| Build command | `echo 'no build'` |
| Start command | `npx serve . -l 3000` |

---

## Step 4 — Add Cognito authentication

```bash
amplify add auth
```

Answers:
| Prompt | Answer |
|---|---|
| Configuration | `Default configuration` |
| Sign-in method | `Email` |
| Advanced settings | `Yes` → add custom attributes |

Add these **custom attributes** when prompted:
- `role` (String, mutable)
- `restaurant` (String, mutable)

---

## Step 5 — Add API Gateway + Lambda

```bash
amplify add api
```

Answers:
| Prompt | Answer |
|---|---|
| Service | `REST` |
| API name | `livehushhApi` |
| Path | `/` |
| Lambda source | `Create a new Lambda function` |
| Function name | `livehushhApiHandler` |
| Runtime | `NodeJS` |
| Template | `Hello World` |
| Restrict access | `Yes` → Authenticated users → `read/write` |
| Another path? | `No` |

After this, **replace** the generated Lambda source with your `lambda/api/index.js`:

```bash
# The generated function lives at:
# amplify/backend/function/livehushhApiHandler/src/

copy lambda\api\index.js amplify\backend\function\livehushhApiHandler\src\index.js
copy lambda\api\package.json amplify\backend\function\livehushhApiHandler\src\package.json
```

---

## Step 6 — Set the MongoDB URI environment variable

In the **AWS Console** → Lambda → `livehushhApiHandler` → Configuration → Environment variables:

| Key | Value |
|---|---|
| `MONGO_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority` |

Get this URI from **MongoDB Atlas** → Connect → Drivers → copy the connection string.

---

## Step 7 — Deploy everything

```bash
amplify push
```

This provisions Cognito, API Gateway, and Lambda. At the end it prints:
- **User Pool ID** — looks like `us-east-1_XXXXXXXX`
- **App Client ID** — long alphanumeric string
- **API Gateway URL** — `https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

---

## Step 8 — Fill in js/aws-config.js

Open `js/aws-config.js` and replace the placeholder values:

```js
window.LH_CONFIG = {
  cognito: {
    region:     'us-east-1',                // your region
    userPoolId: 'us-east-1_XXXXXXXX',       // from Step 7
    clientId:   'abcdef123456...',          // from Step 7
  },
  api: {
    baseUrl: 'https://xxx.execute-api.us-east-1.amazonaws.com/prod',  // from Step 7
  },
  sheetsUrl: 'https://script.google.com/...',  // optional — from google-sheets-script.js setup
};
```

---

## Step 9 — Connect your domain (www.livehushh.com)

```bash
amplify add hosting
```

Choose **Amplify Console** (managed hosting). Then:

1. Open **AWS Amplify Console** in the browser
2. Go to your app → **Domain management**
3. Click **Add domain** → enter `livehushh.com`
4. Amplify shows you the DNS records to add — log in to your domain registrar (GoDaddy, Namecheap, etc.)
5. Add the CNAME records provided
6. Wait ~30 min for DNS propagation

---

## Step 10 — Publish

```bash
amplify publish
```

Your app is now live at `https://www.livehushh.com`.

---

## MongoDB Atlas — quick setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and log in
2. Create a free **M0** cluster
3. **Database Access** → Add user (username + password)
4. **Network Access** → Add IP → Allow access from anywhere (`0.0.0.0/0`) for Lambda
5. **Connect** → Drivers → copy the URI → paste into Lambda env var (Step 6)

Collections created automatically on first write:
- `users` — Cognito profile data
- `restaurants` — owner restaurant info
- `orders` — customer orders
- `waitlist` — dine-in waitlist entries
- `videos` — uploaded videos pending review

---

## Google Sheets (optional lead capture)

See `google-sheets-script.js` for full setup instructions. Once deployed, paste the Web App URL into `js/aws-config.js` → `sheetsUrl`.

---

## Ongoing commands

| Task | Command |
|---|---|
| Deploy code changes | `amplify publish` |
| Update Lambda only | `amplify push function` |
| Open Amplify Console | `amplify console` |
| Check status | `amplify status` |
