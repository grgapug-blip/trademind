# TradeMind Deployment Guide

## Current Hosted Link Duration

The link provided (`https://2v4ydc3k4obco.ok.kimi.link`) is a **temporary demo link** that typically stays active for **7-30 days** depending on the platform's policies. For permanent hosting, you'll need to deploy to your own infrastructure.

---

## Local Deployment (Windows 11)

### Option 1: Native Windows (Node.js)

#### Prerequisites
- [Node.js 20+](https://nodejs.org/) installed
- Git (optional, for cloning)

#### Steps

1. **Download the project files** from the output folder

2. **Open PowerShell or Command Prompt** as Administrator

3. **Navigate to the project folder:**
   ```powershell
   cd C:\path\to\trademind
   ```

4. **Install dependencies:**
   ```powershell
   npm install
   ```

5. **Build the project:**
   ```powershell
   npm run build
   ```

6. **Serve the built files** (choose one):

   **Option A: Using npx serve (simplest)**
   ```powershell
   npx serve -s dist -p 3000
   ```
   Then open http://localhost:3000

   **Option B: Using Python (if installed)**
   ```powershell
   cd dist
   python -m http.server 3000
   ```
   Then open http://localhost:3000

   **Option C: Using Node.js http-server**
   ```powershell
   npm install -g http-server
   http-server dist -p 3000
   ```

---

### Option 2: WSL Ubuntu (Recommended for Developers)

#### Prerequisites
- WSL2 with Ubuntu installed
- Node.js 20+ in WSL

#### Steps

1. **Open WSL Ubuntu terminal**

2. **Copy project to WSL** (from Windows):
   ```bash
   # In WSL, access Windows files via /mnt/
   cp -r /mnt/c/path/to/trademind ~/trademind
   cd ~/trademind
   ```

3. **Or clone if using git:**
   ```bash
   git clone <your-repo-url> ~/trademind
   cd ~/trademind
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Build:**
   ```bash
   npm run build
   ```

6. **Serve locally:**
   ```bash
   # Using npx serve
   npx serve -s dist -l 3000
   
   # Or using Python
   cd dist && python3 -m http.server 3000
   ```

7. **Access from Windows browser:**
   - Open http://localhost:3000
   - WSL automatically forwards ports to Windows

---

## Vercel Deployment (Free, Recommended)

Vercel is the **easiest and fastest** option for hosting React apps with automatic deployments.

### Prerequisites
- [Vercel account](https://vercel.com/signup) (free)
- [GitHub/GitLab/Bitbucket account](https://github.com/signup)

### Steps

#### 1. Push Code to GitHub

```bash
# Initialize git repo
cd trademind
git init

# Create .gitignore
echo "node_modules/
dist/
.env
.env.local" > .gitignore

# Add and commit
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/trademind.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# ? Set up and deploy "~/trademind"? [Y/n] Y
# ? Which scope do you want to deploy to? [your-account]
# ? Link to existing project? [n]
# ? What's your project name? [trademind]
# ? In which directory is your code located? [./]
```

**Option B: Vercel Dashboard (GUI)**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Vite/React settings
4. Click "Deploy"
5. Your app will be live at `https://trademind.vercel.app`

#### 3. Auto-Deployment Setup

Vercel automatically redeploys on every git push:

```bash
# Make changes
git add .
git commit -m "Update dashboard"
git push
# Vercel automatically rebuilds and deploys!
```

### Vercel Configuration (Optional)

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Cloud Instance Deployment (VPS/EC2/DigitalOcean)

### Option 1: AWS EC2 (Free Tier Eligible)

#### Prerequisites
- AWS account
- EC2 instance (t2.micro is free tier eligible)

#### Steps

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t2.micro
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect to instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

5. **Upload/Clone your project:**
   ```bash
   # Option A: Clone from GitHub
   git clone https://github.com/YOUR_USERNAME/trademind.git
   cd trademind
   
   # Option B: Upload via SCP from local
   # scp -r -i your-key.pem ./dist ubuntu@your-ec2-ip:~/trademind/
   ```

6. **Build (if uploading source):**
   ```bash
   npm install
   npm run build
   ```

7. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/trademind
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Or your EC2 IP
       root /home/ubuntu/trademind/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

8. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/trademind /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Access your app:**
   - http://your-ec2-ip

#### Optional: Add HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: DigitalOcean Droplet

#### Steps

1. **Create Droplet**
   - OS: Ubuntu 22.04
   - Plan: Basic ($5/month)
   - Datacenter: Closest to you

2. **Connect via SSH:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Create non-root user (recommended):**
   ```bash
   adduser trademind
   usermod -aG sudo trademind
   su - trademind
   ```

4. **Install Node.js and Nginx:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   ```

5. **Clone and build:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/trademind.git
   cd trademind
   npm install
   npm run build
   ```

6. **Configure Nginx** (same as EC2 above)

7. **Access:** http://your-droplet-ip

---

### Option 3: Google Cloud Platform (GCP)

#### Using Cloud Run (Serverless, Pay-per-use)

1. **Install Google Cloud SDK**

2. **Build and deploy:**
   ```bash
   # Build container
   gcloud builds submit --tag gcr.io/PROJECT_ID/trademind
   
   # Deploy to Cloud Run
   gcloud run deploy trademind \
     --image gcr.io/PROJECT_ID/trademind \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

#### Using Compute Engine VM

Similar to EC2 - create VM, install Node.js + Nginx, deploy.

---

### Option 4: Azure Static Web Apps (Free Tier)

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create static web app
az staticwebapp create \
  --name trademind \
  --resource-group myResourceGroup \
  --source https://github.com/YOUR_USERNAME/trademind \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

---

## Docker Deployment (Universal)

### Create Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t trademind .

# Run locally
docker run -d -p 3000:80 --name trademind trademind

# Access at http://localhost:3000
```

### Deploy Docker to Cloud

**AWS ECS/Fargate:**
```bash
# Push to ECR
aws ecr create-repository --repository-name trademind
docker tag trademind:latest YOUR_AWS_ACCOUNT.dkr.ecr.region.amazonaws.com/trademind:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.region.amazonaws.com/trademind:latest

# Deploy via ECS console or CLI
```

**Google Cloud Run:**
```bash
gcloud run deploy trademind --source . --platform managed
```

---

## Quick Reference: Deployment Comparison

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Local (Windows/WSL)** | Free | Easy | Development, testing |
| **Vercel** | Free | Very Easy | Production, auto-deploy |
| **Netlify** | Free | Very Easy | Alternative to Vercel |
| **AWS EC2** | Free tier | Medium | Full control, scaling |
| **DigitalOcean** | $5/mo | Medium | Simple VPS hosting |
| **Azure Static** | Free tier | Easy | Microsoft ecosystem |
| **GCP Cloud Run** | Pay-per-use | Medium | Serverless, auto-scale |
| **Docker** | Varies | Medium | Portable, consistent |

---

## Recommended Setup for You

### For Quick Testing (Right Now)
```bash
# WSL Ubuntu
cd ~/trademind
npm install
npm run build
npx serve -s dist -l 3000
# Open http://localhost:3000 in Windows browser
```

### For Production (Permanent Hosting)
1. **Push to GitHub**
2. **Connect to Vercel** (free, automatic deploys)
3. **Custom domain** (optional): Add your domain in Vercel settings

### For Full Control
- **DigitalOcean Droplet** ($5/month) + **Nginx**
- Or **AWS EC2** (free tier for 12 months)

---

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 errors on refresh (SPA routing)
Ensure your server is configured to serve `index.html` for all routes (see Nginx config above).

---

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production (Let's Encrypt is free)
3. **Headers**: Add security headers in Nginx:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```

---

Need help with any specific deployment method? Let me know!
