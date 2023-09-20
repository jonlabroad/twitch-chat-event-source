.\build-image.ps1
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ecrLogin 796987500533.dkr.ecr.us-east-1.amazonaws.com
docker tag twitch-chat-event-source:latest 796987500533.dkr.ecr.us-east-1.amazonaws.com/hoagierepo:latest
docker push 796987500533.dkr.ecr.us-east-1.amazonaws.com/hoagierepo:latest
