# Server Setup (First time setup only)

```bash
ssh-keygen
```
- Generate the key at path: `~/.ssh/id_ed25519`

### Add SSH Key to Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Add Public Key to EC2 Instance
```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```
---

### Clone Repository
```bash
git clone git@github.com-callsparkdev:callsparkdev/Caller-AI-Agent.git
cd Caller-AI-Agent
git fetch --all
git checkout production
```

### Create and Activate Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Update System and Install Requirements
```bash
sudo apt update  # Update package lists (for Ubuntu/Debian)
pip install -r requirements.txt
sudo apt-get install portaudio19-dev
```

### Install and Configure Nginx as default site for now at /etc/nginx/sites-available/default
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Update the default site to point to the FastAPI server with WebSocket support
```bash
sudo nano /etc/nginx/sites-available/default
```


```nginx
#######################################
# HTTP (port 80) - No Redirect
#######################################
server {
    listen 80;
    server_name www.aimusictimes.com;

    # Since you want no redirect, simply proxy all requests:
    location / {
        proxy_pass http://127.0.0.1:5000;
        
        # Forward standard headers
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Support WebSockets over plain HTTP (rarely used but won't hurt)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}


#######################################
# HTTPS (port 443) with SSL + WebSockets
#######################################
server {
    listen 443 ssl;
    server_name www.aimusictimes.com;

    # --- SSL Certificates (managed by Certbot) ---
    ssl_certificate     /etc/letsencrypt/live/www.aimusictimes.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.aimusictimes.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    #
    # 1) Location block for WebSocket route:
    #
    #    This ensures wss://www.aimusictimes.com/caller_ai/stream_call_audio
    #    connects properly without sending a 301 redirect.
    #
    location /caller_ai/stream_call_audio {
        proxy_pass http://127.0.0.1:5000/caller_ai/stream_call_audio;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard headers
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeouts for long-lived connections
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    #
    # 2) Catch-all for everything else
    #
    location / {
        proxy_pass http://127.0.0.1:5000;
        
        # WebSocket upgrade (in case you have additional websocket endpoints)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard headers
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Test and Reload Nginx Configuration
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Update .env file
```bash
cp .env.example .env
```

### Start the Application with Gunicorn
```bash
gunicorn --threads 4 -w 4 -b 0.0.0.0:5000 app.main:app
```

---

## Configure Godaddy

- Add A record to point to the EC2 instance's public IP address.
- The update should take effect within 10-15 minutes. Keep pinging the domain to check if it's working.

## Verify Domain DNS Settings
```bash
nslookup aimusictimes.com   # This will show the IP address of the domain
ping aimusictimes.com
```

---

## SSL Configuration
After the domain is working (on verifying with nslookup), we can configure SSL.

### Install Certbot for SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo apt-get install --reinstall certbot
```

### Obtain SSL Certificates
```bash
sudo certbot --nginx -d www.aimusictimes.com
```

### Test SSL Renewal
```bash
sudo certbot renew --dry-run
```

### Revoke SSL Certificate
```bash
sudo certbot revoke --cert-path /etc/letsencrypt/live/www.aimusictimes.com/fullchain.pem
```

---

## CI/CD Setup

### Generate and Configure SSH Keys on EC2 Instance
- Add the private key to GitHub Secrets as `EC2_SSH_KEY`
- Add the public URL to Github Secrets as `EC2_PUBLIC_IP` (e.g., `aimusictimes.com` or your server ip address)


### CI/CD Deployment
- Each push to the production branch will trigger the `deploy.yml` to deploy the latest code to the EC2 instance.

---

## Logs

### Log Location
```bash
/home/ubuntu/Caller-AI-Agent/backend.log
```

### View Logs in Terminal
```bash
tail -f /home/ubuntu/Caller-AI-Agent/backend.log
```

---

## Kill the Server
```bash
pkill gunicorn

or kill the process by its PID
```bash
sudo lsof -i :5000
kill -9 <PID>
```
