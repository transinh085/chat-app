# Generated by Django 5.0.1 on 2024-03-16 07:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0011_alter_conversation_creator_alter_conversation_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='conversation',
            name='title',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
