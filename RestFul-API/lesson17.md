
# Chapter 17 — Deployment and DevOps for Node.js REST APIs

## Learning Objectives

By the end of this chapter, you should understand:

1. What deployment means and how production architecture works.
2. How Linux servers work.
3. How to connect to a remote server using SSH.
4. How to configure MongoDB Atlas.
5. How to deploy a Node.js application.
6. How to manage Node.js processes using PM2.
7. How Nginx works as a reverse proxy.
8. How to configure a domain and HTTPS.
9. How to automate testing with GitHub Actions.
10. How to monitor applications and manage backups.

---

# 1. What Is Deployment?

Until now, we've developed our API on our own computer.

For example:

```text
http://localhost:3000/api/users/profile
```

But `localhost` refers to your own computer.

Someone using another computer cannot access your localhost API.

We need a machine connected to the internet that can run our application continuously.

This process is called **deployment**.

### Development vs Production

| Development | Production |
|---|---|
| Runs on your computer | Runs on a server |
| localhost | Public domain |
| Development database | Production database |
| Debugging enabled | Secure error handling |
| Frequent code changes | Controlled releases |
| Usually temporary | Expected to run continuously |

### What is a production server?

A production server is a computer configured to host applications for real users.

It generally has:

- An operating system, commonly Linux.
- A public IP address.
- Network connectivity.
- Application runtime such as Node.js.
- A database connection.
- Security and monitoring configurations.

You can rent a virtual server from a hosting provider.

Examples include AWS EC2, DigitalOcean Droplets, and Hetzner Cloud.

---

# 2. Understand the Deployment Architecture

Before deploying anything, understand how a request travels through a production system.

Our architecture will look like this:

```text
                    INTERNET
                        |
                        |
                  Client / Browser
                        |
                        |
                  Domain Name
                api.example.com
                        |
                        |
                     HTTPS
                        |
                        |
                     NGINX
                 Reverse Proxy
                        |
                        |
                 Node.js / Express
                    Port 3000
                        |
             +----------+----------+
             |                     |
             |                     |
          MongoDB              Cloud Storage
           Atlas             Cloudinary / S3
```

Let's understand each component.

### 2.1 Client

The client could be:

- A React application.
- A mobile application.
- Postman.
- Another backend service.

It sends HTTP requests to our API.

Example:

```http
GET /api/v1/users/profile
Authorization: Bearer YOUR_JWT
```

### 2.2 Domain Name

Instead of asking users to remember an IP address:

```text
http://203.0.113.10
```

We provide a domain:

```text
https://api.example.com
```

DNS translates the domain name into an IP address.

### 2.3 Nginx

Nginx receives incoming HTTP/HTTPS requests and forwards them to our Node.js application.

It can also handle:

- HTTPS termination.
- Request routing.
- Static files.
- Connection management.
- Basic load balancing.

### 2.4 Node.js / Express

Our actual backend application runs here.

It handles:

- Authentication.
- Authorization.
- Business logic.
- Database queries.
- File upload operations.
- API responses.

### 2.5 MongoDB Atlas

Our database is hosted separately from our application server.

This means our application server does not need to store the database locally.

### Why not expose Node.js directly?

We could expose our Node.js application on port 3000.

However, a reverse proxy provides a better place to manage HTTPS, request forwarding, and other server-level responsibilities.

Our Node.js application will listen on:

```text
127.0.0.1:3000
```

Only Nginx will communicate with it locally.

---

# 3. VPS vs PaaS

There are two common deployment approaches.

## 3.1 VPS — Virtual Private Server

A VPS is a virtual machine that you rent from a hosting provider.

You receive control over:

- Operating system.
- Installed software.
- Firewall.
- Nginx.
- Node.js.
- Process management.
- Server configuration.

You are responsible for maintaining it.

Examples:

- AWS EC2
- DigitalOcean Droplets
- Hetzner Cloud

## 3.2 PaaS — Platform as a Service

PaaS providers manage much of the infrastructure for you.

You generally provide your application code and environment variables.

The platform handles much of the deployment infrastructure.

Examples:

- Render
- Railway
- Fly.io

### Comparison

| Feature | VPS | PaaS |
|---|---|---|
| Server control | High | Limited |
| Initial setup | More work | Easier |
| Server maintenance | Your responsibility | Mostly managed |
| Nginx configuration | Usually your responsibility | Often managed |
| Learning Linux | Excellent | Less necessary |

In this chapter, we'll focus on a VPS because it teaches you how production infrastructure actually works.

---

# 4. Linux Server Fundamentals

Most backend servers run Linux.

We'll use Ubuntu Server.

Before deploying Node.js, understand some basic Linux concepts.

## 4.1 Terminal

The terminal allows you to communicate with the operating system using commands.

For example:

```bash
pwd
```

Displays your current directory.

```bash
ls
```

Lists files and directories.

```bash
cd projects
```

Moves into the projects directory.

```bash
mkdir secure-api
```

Creates a directory.

```bash
rm filename.txt
```

Deletes a file.

Be careful with deletion commands. In particular, never run an unfamiliar `rm -rf` command without understanding its target.

## 4.2 Important Linux Commands

### Check current user

```bash
whoami
```

### Check server information

```bash
uname -a
```

### Check disk usage

```bash
df -h
```

### Check memory usage

```bash
free -h
```

### Check running processes

```bash
ps aux
```

### Check which process uses a port

```bash
sudo lsof -i :3000
```

### Check network configuration

```bash
ip addr
```

## 4.3 Package Management

Ubuntu uses APT to install and update software.

Update package information:

```bash
sudo apt update
```

Upgrade installed packages:

```bash
sudo apt upgrade -y
```

Install a package:

```bash
sudo apt install nginx -y
```

Remove a package:

```bash
sudo apt remove nginx
```

`sudo` runs a command with elevated privileges.

It is similar to administrator privileges in Windows.

## 4.4 Linux Permissions

Linux has three main permission categories:

- User: the owner of a file.
- Group: users belonging to a group.
- Others: everyone else.

Example:

```bash
chmod 600 .env
```

This gives the owner read/write access and removes access for group and other users.

This is useful for protecting environment files containing secrets.

## 4.5 Services and systemctl

Linux services are commonly managed through `systemd`.

For example, Nginx is a service.

Check its status:

```bash
sudo systemctl status nginx
```

Start it:

```bash
sudo systemctl start nginx
```

Stop it:

```bash
sudo systemctl stop nginx
```

Restart it:

```bash
sudo systemctl restart nginx
```

Enable it at boot:

```bash
sudo systemctl enable nginx
```

## 4.6 Reading system logs

Use `journalctl` to inspect logs managed by systemd.

```bash
sudo journalctl -u nginx
```

Follow new log entries:

```bash
sudo journalctl -u nginx -f
```

The `-f` option means follow.

---

# 5. Connect to a Server Using SSH

SSH stands for Secure Shell.

It allows you to connect to a remote Linux server securely.

Suppose your server has this IP address:

```text
203.0.113.10
```

Connect using:

```bash
ssh username@203.0.113.10
```

For example:

```bash
ssh deploy@203.0.113.10
```

You will be asked to authenticate.

## 5.1 SSH Keys

SSH keys provide an alternative to password-based authentication.

They consist of two parts:

1. Private key.
2. Public key.

The private key stays on your computer.

The public key is added to the server.

Generate a key pair on your local machine:

```bash
ssh-keygen -t ed25519 -C "deployment-key"
```

Copy the public key to the server using a secure method.

For example, where supported:

```bash
ssh-copy-id deploy@203.0.113.10
```

Never upload or share your private key.

## 5.2 Create a deployment user

Avoid running your application as the root user.

On Ubuntu, you can create a separate user:

```bash
sudo adduser deploy
```

Grant administrative privileges only if the deployment workflow requires them:

```bash
sudo usermod -aG sudo deploy
```

Set up SSH access for this account.

Important: Do not disable root or password-based SSH access until you have verified that your new account can log in using its SSH key.

Keep your existing SSH session open and test a second session first. Otherwise, you could lock yourself out.

## 5.3 Configure the Firewall

Ubuntu commonly uses UFW as its firewall management tool.

Allow SSH:

```bash
sudo ufw allow OpenSSH
```

Allow HTTP and HTTPS:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Enable the firewall:

```bash
sudo ufw enable
```

Check the rules:

```bash
sudo ufw status
```

Do not expose port 3000 publicly when Nginx is forwarding traffic locally.

---

# 6. Install Node.js on the Server

Our API requires Node.js.

A practical approach is to use NVM (Node Version Manager).

NVM lets you install and switch between Node.js versions.

Install NVM using its official installation instructions.

Then install an actively supported Node.js LTS version:

```bash
nvm install --lts
```

Select the installed version:

```bash
nvm use --lts
```

Check versions:

```bash
node -v
npm -v
```

Why use an LTS version?

LTS means Long-Term Support.

It provides a more predictable foundation for production applications than choosing an arbitrary or unsupported Node.js release.

---

# 7. Configure MongoDB Atlas

Our application currently uses a local MongoDB connection:

```env
MONGO_URI=mongodb://127.0.0.1:27017/secure_api
```

This works locally.

But when we deploy the application, our production database should be accessible from the server.

We'll use MongoDB Atlas.

## 7.1 What is MongoDB Atlas?

MongoDB Atlas is a managed cloud database service.

Instead of installing and maintaining MongoDB ourselves, Atlas manages the database infrastructure.

Our architecture becomes:

```text
Node.js Server
      |
      |
      | Internet / Secure Connection
      |
      v
MongoDB Atlas
```

## 7.2 Atlas Setup

The general process is:

1. Create a MongoDB Atlas account.
2. Create a project.
3. Create a database cluster.
4. Create a database user.
5. Configure network access.
6. Obtain the connection string.

## 7.3 Database User

Create a dedicated database user for the application.

Give it only the permissions it needs.

Avoid using an administrator account for normal application operations.

## 7.4 Network Access

Atlas provides an IP access list.

Add the public IP address of your VPS.

Avoid allowing:

```text
0.0.0.0/0
```

This allows connections from any IPv4 address and is generally inappropriate for a production database.

## 7.5 Connection String

Atlas provides a connection string similar to:

```text
mongodb+srv://username:password@cluster.example.mongodb.net/secure_api
```

Replace the username and password with your database credentials.

If your password contains special characters, URL-encode them appropriately.

Never commit this connection string to GitHub.

Store it in an environment variable.

---

# 8. Production Environment Variables

Our local `.env` file may contain:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/secure_api
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1h
```

Production needs different values.

Example:

```env
NODE_ENV=production
PORT=3000

MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/secure_api

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=1h

CLIENT_ORIGIN=https://example.com
```

If we use Cloudinary or S3, we also configure their credentials through environment variables.

## 8.1 Generate a secure JWT secret

On a trusted machine, you can generate a random secret using:

```bash
openssl rand -base64 48
```

Keep the generated value private.

Do not paste it into public code repositories or logs.

## 8.2 Create the production environment file

On the server:

```bash
nano .env
```

Add the production values.

Restrict permissions:

```bash
chmod 600 .env
```

Make sure `.env` is included in `.gitignore`.

Example:

```gitignore
node_modules/
.env
.env.*
!.env.example
uploads/
```

If your project needs persistent local uploads, configure a separate persistent storage location rather than relying on an ignored, disposable deployment directory.

## 8.3 Load environment variables

Our application should load dotenv before importing modules that read environment variables.

In the entry point:

```javascript
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
```

For production, environment variables can also be injected through a process manager or secret manager instead of using a `.env` file.

---

# 9. Prepare the Project for Deployment

Our project structure is approximately:

```text
secure-api/
│
├── server.js
├── package.json
├── .env
├── .gitignore
│
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   └── utils/
│
└── tests/
```

Make sure:

- The application starts using `server.js`.
- Database connection errors are handled.
- The production environment is configured.
- Tests pass.
- Secrets are not committed.
- Your Git repository contains the required source files.

## 9.1 Clone the repository

On your VPS:

```bash
mkdir -p ~/apps
cd ~/apps
```

Clone your repository:

```bash
git clone YOUR_REPOSITORY_URL secure-api
```

Enter the project:

```bash
cd secure-api
```

Install production dependencies:

```bash
npm ci --omit=dev
```

`npm ci` installs dependencies according to the lockfile.

Important: If your project needs a build step, such as TypeScript compilation, install the required development dependencies for the build first. Only prune development dependencies after building.

For our CommonJS JavaScript application, a separate compilation step is not normally required.

---

# 10. Test the Application Before Process Management

Start the application manually:

```bash
node server.js
```

If everything is configured correctly, you should see a successful database connection and server startup message.

Test your health endpoint:

```bash
curl http://127.0.0.1:3000/health
```

An example response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

Stop the application using:

```text
Ctrl + C
```

We don't want to keep managing the application manually.

That's where PM2 comes in.

---

# 11. PM2 — Process Management

## 11.1 What problem does PM2 solve?

Imagine our Node.js application is running:

```bash
node server.js
```

Now suppose:

- The terminal closes.
- The application crashes.
- The server restarts.
- The Node.js process unexpectedly exits.

Our application may stop responding.

PM2 is a process manager for Node.js applications.

It helps us:

- Keep applications running in the background.
- Restart applications after crashes.
- Manage application processes.
- View logs.
- Configure startup after a server reboot.

## 11.2 Install PM2

```bash
npm install -g pm2
```

## 11.3 Start the application

From the project directory:

```bash
pm2 start server.js --name secure-api
```

PM2 starts the application in the background.

## 11.4 Useful PM2 commands

Check processes:

```bash
pm2 list
```

View logs:

```bash
pm2 logs secure-api
```

Restart:

```bash
pm2 restart secure-api
```

Reload:

```bash
pm2 reload secure-api
```

Stop:

```bash
pm2 stop secure-api
```

Delete from PM2:

```bash
pm2 delete secure-api
```

## 11.5 Start PM2 automatically after reboot

Run:

```bash
pm2 startup
```

PM2 will print a command that you must execute with the appropriate permissions.

Copy and run the exact command it provides.

Then save the current process list:

```bash
pm2 save
```

This allows PM2 to restore the saved processes after a reboot.

## 11.6 PM2 ecosystem configuration

For a more maintainable configuration, create:

`ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: "secure-api",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",

      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    }
  ]
};
```

Start it:

```bash
pm2 start ecosystem.config.js --env production
```

Do not put database passwords, JWT secrets, or cloud credentials inside a committed PM2 configuration file.

## 11.7 Cluster mode

PM2 can run multiple instances of an application.

For example:

```javascript
instances: "max",
exec_mode: "cluster"
```

This can improve CPU utilization for suitable applications.

However, before using multiple instances, consider:

- MongoDB connection pool sizes.
- Shared rate-limiting storage.
- In-memory sessions.
- WebSocket connections.
- Memory usage.
- Whether your application has shared mutable state.

Do not assume cluster mode automatically makes every application faster.

---

# 12. Nginx — Reverse Proxy

## 12.1 What is a reverse proxy?

A reverse proxy receives requests from clients and forwards them to backend servers.

Our Node.js application listens on:

```text
127.0.0.1:3000
```

But users should access:

```text
https://api.example.com
```

Nginx connects these two sides.

```text
Client
  |
  | HTTPS
  v
Nginx :443
  |
  | HTTP on localhost
  v
Express :3000
```

The user does not need to know that our Express application is running on port 3000.

## 12.2 Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

Check its status:

```bash
sudo systemctl status nginx
```

## 12.3 Create an Nginx configuration

Create a configuration file:

```bash
sudo nano /etc/nginx/sites-available/secure-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.example.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Replace `api.example.com` with your actual domain.

### Understand the important directives

**server_name**

Specifies the domain handled by this server block.

**listen 80**

Listens for HTTP traffic.

**client_max_body_size**

Sets the maximum accepted request body size.

This matters for our file upload endpoints.

It should be compatible with the upload limits configured in Multer and any upstream service.

**proxy_pass**

Forwards incoming requests to our Express application.

**proxy_set_header**

Forwards useful request information to the backend.

For example:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

This allows the backend to receive forwarded client IP information.

## 12.4 Enable the configuration

Create a symbolic link:

```bash
sudo ln -s /etc/nginx/sites-available/secure-api /etc/nginx/sites-enabled/
```

Check the configuration:

```bash
sudo nginx -t
```

If the configuration is valid:

```bash
sudo systemctl reload nginx
```

Allow Nginx through the firewall:

```bash
sudo ufw allow 'Nginx Full'
```

## 12.5 Trust proxy in Express

When Express is behind a reverse proxy, the original request information is forwarded through headers.

You may configure:

```javascript
app.set("trust proxy", 1);
```

This example assumes exactly one trusted proxy hop.

Do not blindly trust all proxies.

Incorrect proxy configuration can affect:

- Client IP detection.
- Rate limiting.
- Secure cookies.
- Request security decisions.

---

# 13. Domain Name and DNS

Our API currently has a server IP address.

We want users to access it through:

```text
api.example.com
```

DNS makes this possible.

## 13.1 A Record

An A record maps a domain name to an IPv4 address.

Example:

| Type | Name | Value |
|---|---|---|
| A | api | 203.0.113.10 |

Here:

```text
api.example.com
```

points to:

```text
203.0.113.10
```

The IP address above is an example address. Use the actual public IP of your server.

If your server has a configured IPv6 address, you can also create an AAAA record.

Do not create an AAAA record pointing to an address that is not configured and reachable.

DNS changes may take time to propagate.

---

# 14. HTTPS and SSL Certificates

## 14.1 HTTP vs HTTPS

HTTP transfers data between clients and servers.

HTTPS uses TLS to protect the connection.

Without HTTPS, sensitive information may be exposed to network attackers.

This is particularly important for our API because it handles:

- Login credentials.
- JWT access tokens.
- User information.
- Password reset tokens.
- Private files.

## 14.2 What is TLS?

TLS stands for Transport Layer Security.

It provides:

1. Encryption.
2. Authentication of the server.
3. Integrity protection.

The browser or client verifies the server's certificate before establishing a secure connection.

## 14.3 Certbot

Certbot helps obtain and configure certificates from Let's Encrypt.

Install Certbot and the Nginx plugin using the appropriate packages for your Ubuntu release.

On Ubuntu systems where these packages are available:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

Request a certificate:

```bash
sudo certbot --nginx -d api.example.com
```

Follow the instructions.

Certbot can configure Nginx to use HTTPS and redirect HTTP traffic to HTTPS.

Test renewal:

```bash
sudo certbot renew --dry-run
```

Now our API should be available at:

```text
https://api.example.com
```

---

# 15. GitHub Actions — Continuous Integration

Let's understand CI/CD.

## 15.1 What is CI?

CI stands for Continuous Integration.

Developers frequently push code changes to a shared repository.

Instead of manually testing every change, CI automatically runs checks.

For example:

```text
Developer pushes code
        |
        v
GitHub Repository
        |
        v
GitHub Actions
        |
        v
Install Dependencies
        |
        v
Run Tests
        |
        v
Success / Failure
```

If tests fail, the workflow reports the failure.

## 15.2 What is CD?

CD commonly refers to Continuous Delivery or Continuous Deployment.

A delivery workflow prepares changes for release.

A deployment workflow can automatically deploy changes to a server after successful checks and approval conditions.

CI and CD help reduce manual deployment mistakes.

## 15.3 Create a GitHub Actions workflow

Inside your project:

```text
.github/
  workflows/
    test.yml
```

Add:

```yaml
name: Node.js API Tests

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

Use a Node.js version supported by your application and test environment. Keep your workflow version aligned with the runtime you deploy.

### Understand the workflow

**name**

The workflow's display name.

**on**

Defines when the workflow runs.

**push**

Runs when code is pushed to the specified branch.

**pull_request**

Runs when a pull request targets the specified branch.

**jobs**

Defines the tasks GitHub Actions executes.

**runs-on**

Specifies the runner environment.

**steps**

Defines individual actions and shell commands.

**npm ci**

Installs dependencies using the lockfile.

**npm test**

Runs the test script in `package.json`.

## 15.4 GitHub Secrets

Production credentials must not be written directly into workflow files.

GitHub provides repository or environment secrets.

Examples:

```text
DEPLOY_HOST
DEPLOY_USER
DEPLOY_SSH_KEY
MONGO_URI
JWT_SECRET
```

Use secrets only when the workflow needs them.

Do not print them in logs.

A deployment workflow can then:

1. Run tests.
2. Connect to the deployment server.
3. Fetch the latest approved code.
4. Install dependencies.
5. Restart PM2.
6. Check the health endpoint.

For a real deployment pipeline, also plan rollback, SSH host verification, restricted deployment permissions, and post-deployment health checks.

Start with the test workflow above before automating production deployment.

---

# 16. Production Monitoring

Deployment is not the end of backend engineering.

We must know whether our API is healthy.

Imagine users report:

"The API is not responding."

How would you investigate?

## 16.1 PM2 Monitoring

Check running applications:

```bash
pm2 list
```

View logs:

```bash
pm2 logs secure-api
```

View recent logs:

```bash
pm2 logs secure-api --lines 100
```

PM2 can also provide process monitoring:

```bash
pm2 monit
```

## 16.2 Nginx Logs

Nginx commonly stores logs in:

```text
/var/log/nginx/
```

Access log:

```bash
sudo tail -f /var/log/nginx/access.log
```

Error log:

```bash
sudo tail -f /var/log/nginx/error.log
```

These help investigate incoming requests and proxy errors.

## 16.3 Log Rotation

Logs can grow over time.

PM2 supports a log rotation module:

```bash
pm2 install pm2-logrotate
```

Configure retention and file size according to your storage capacity and operational needs.

## 16.4 Health Check Endpoint

Our application should provide a health endpoint.

Example:

```javascript
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy"
  });
});
```

A basic health check confirms that the HTTP application is responding.

A more advanced readiness check can verify dependencies such as MongoDB.

Keep the distinction clear:

- Liveness: Is the process running?
- Readiness: Can the application serve requests successfully?

Do not expose sensitive internal information through health endpoints.

## 16.5 Error Monitoring

For larger applications, you may integrate tools such as:

- Sentry for error tracking.
- OpenTelemetry for tracing and instrumentation.
- Prometheus for metrics.
- Grafana for dashboards.

These tools help identify failures and performance problems.

Never log passwords, JWT secrets, full authorization headers, or private reset tokens.

---

# 17. Database Backups

Imagine our production database contains:

- 10,000 registered users.
- Thousands of posts.
- User profile information.
- Business records.

Now imagine the database is accidentally deleted.

Without backups, recovering this data may be impossible.

## 17.1 What is a backup?

A backup is a copy of data that can be restored after loss or corruption.

For MongoDB Atlas, investigate the backup and snapshot options available for your cluster and subscription.

Do not assume every cluster has automated backups enabled by default.

## 17.2 Backup strategy

A sensible strategy considers:

- How frequently backups are taken.
- How long backups are retained.
- Whether backups are encrypted.
- Who can access backups.
- How restoration is tested.

## 17.3 RPO and RTO

Two important disaster-recovery concepts:

**RPO — Recovery Point Objective**

How much data loss, measured in time, can the business tolerate?

Example:

An RPO of one hour means the business aims to lose no more than approximately one hour of recent data.

**RTO — Recovery Time Objective**

How long can the application remain unavailable?

Example:

An RTO of two hours means the recovery target is to restore service within two hours.

## 17.4 Test restoration

A backup is not useful if it cannot be restored.

Periodically restore a backup into a separate environment and verify that the application can use it.

For Cloudinary or S3, consider object versioning, retention, lifecycle policies, and backup requirements separately from MongoDB backups.

---

# 18. Common Deployment Problems

## Problem 1: Connection refused

Example:

```text
connect ECONNREFUSED 127.0.0.1:3000
```

Possible causes:

- Node.js application is not running.
- Wrong port.
- PM2 process has crashed.
- Nginx points to the wrong address.

Check:

```bash
pm2 list
pm2 logs secure-api
sudo lsof -i :3000
```

## Problem 2: MongoDB connection error

Possible causes:

- Incorrect MONGO_URI.
- Incorrect database credentials.
- VPS IP not allowed in Atlas.
- Network connectivity problem.
- Incorrectly encoded password.

Check the Atlas connection string and network access settings.

## Problem 3: Nginx 502 Bad Gateway

This generally means Nginx cannot successfully communicate with the upstream application.

Check:

```bash
pm2 list
pm2 logs secure-api
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

## Problem 4: CORS error

Possible causes:

- Incorrect frontend origin.
- Credentials configuration mismatch.
- Missing CORS headers.
- Preflight request not handled correctly.

Check your Express CORS configuration.

Remember: CORS is a browser-enforced cross-origin policy. It is not a replacement for authentication or authorization.

## Problem 5: API works locally but not in production

Check:

- Environment variables.
- Node.js version.
- MongoDB access.
- File paths.
- Linux permissions.
- Firewall rules.
- Nginx configuration.
- Production dependencies.

---

# 19. Production Deployment Checklist

Before releasing our API, verify the following.

## Application

- [ ] Production environment configured.
- [ ] Database connection working.
- [ ] JWT secret is strong and private.
- [ ] Registration and login tested.
- [ ] RBAC tested.
- [ ] Validation enabled.
- [ ] Centralized error handling enabled.
- [ ] File upload limits configured.
- [ ] Automated tests passing.

## Server

- [ ] Non-root deployment user created.
- [ ] SSH access secured.
- [ ] Firewall configured.
- [ ] Node.js LTS installed.
- [ ] PM2 configured.
- [ ] PM2 startup configured.
- [ ] Nginx configured.
- [ ] Port 3000 not publicly exposed.

## Security

- [ ] HTTPS enabled.
- [ ] CORS allowlist configured.
- [ ] Rate limiting enabled.
- [ ] Secrets excluded from Git.
- [ ] MongoDB IP access restricted.
- [ ] Database user follows least privilege.
- [ ] Sensitive information excluded from logs.

## Operations

- [ ] Health endpoint tested.
- [ ] Application logs accessible.
- [ ] Nginx logs accessible.
- [ ] Database backups configured.
- [ ] Restoration tested.
- [ ] Restart after reboot tested.
- [ ] Deployment rollback strategy prepared.

---

# 20. Practical Assignment

Deploy your existing Secure REST API to a staging environment.

You do not need to purchase a domain immediately. You can first test using your server's IP address and a temporary HTTP configuration.

Complete these tasks:

1. Create an Ubuntu VPS.
2. Connect using SSH.
3. Create a non-root deployment user.
4. Configure the firewall.
5. Install Node.js LTS.
6. Create a MongoDB Atlas database.
7. Configure production environment variables.
8. Clone your GitHub repository.
9. Start the API using PM2.
10. Install and configure Nginx.
11. Configure a domain if available.
12. Enable HTTPS.
13. Configure GitHub Actions to run tests.
14. Verify the health endpoint.
15. Restart the server and verify that the application starts again.
16. Verify that a backup can be restored in a separate environment.

### Final verification

Test these endpoints using Postman:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/users/profile
PATCH /api/users/profile
GET /api/admin/users
```

Verify that authentication and authorization work in production exactly as expected.

---

# 21. Knowledge Check

Answer these questions before moving forward.

1. What is the difference between development and production?
2. What problem does a VPS solve?
3. What is SSH?
4. Why should we avoid running our application as root?
5. What is MongoDB Atlas?
6. Why should we restrict the Atlas IP access list?
7. Why should secrets be stored in environment variables?
8. What problem does PM2 solve?
9. What happens when we run `pm2 startup`?
10. What is a reverse proxy?
11. Why do we use Nginx in front of Express?
12. What is the purpose of HTTPS?
13. What is the difference between CI and CD?
14. What does GitHub Actions do?
15. What is the difference between RPO and RTO?
16. Why should we test database restoration?

---

# Chapter Summary

We have taken our backend from a locally running application to a production deployment architecture.

Our final architecture is:

```text
React / Mobile Client
         |
         v
    DNS / Domain
         |
         v
     HTTPS / TLS
         |
         v
       Nginx
         |
         v
    Node.js + Express
       (PM2)
         |
         +------> MongoDB Atlas
         |
         +------> Cloudinary / S3
```

The main idea:

**Writing backend code is only one part of backend engineering. You must also understand how applications are deployed, secured, monitored, and maintained.**

## What comes next?

Chapter 18 — Capstone: Complete Secure REST API Integration.

We'll bring the modules together, review the architecture, identify gaps, and prepare the project as a portfolio-quality backend.
