$result = aws ecs update-service --cluster TwitchChatEventSource --service TwitchChatEventSource --force-new-deployment --region us-east-1

Write-Host 'https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/TwitchChatEventSource/services?region=us-east-1'