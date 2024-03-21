# Generated by Django 5.0.1 on 2024-03-20 11:49

import chat.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0013_deletemessage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='message_type',
            field=models.IntegerField(choices=[(1, 'TEXT'), (2, 'IMAGE'), (3, 'VIDEO'), (4, 'AUDIO'), (5, 'FILE'), (6, 'RECALL')], default=chat.models.Message.MessageType['TEXT']),
        ),
    ]