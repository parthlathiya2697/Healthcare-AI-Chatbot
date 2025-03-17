- name: Deploy Backend to EC2
  run: |
    ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.EC2_PUBLIC_IP }} << 'EOF'
    cd ~
    pwd && ls
    cd AI-HealthCare
    git pull origin production
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
    export PYTHONPATH=. && python3 backend/manage.py migrate
    # Check if the app is running and stop it if it is
    if pm2 list | grep -q "app-aihealthcareapi"; then
      pm2 stop app-aihealthcareapi
    fi
    pm2 start python3 --name "app-aihealthcareapi" -- ./backend/manage.py runserver 0.0.0.0:4001
    pm2 save
    EOF
