# Generated by Django 5.0.1 on 2024-03-07 09:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0008_alter_user_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.CharField(blank=True, default='0d8cac6ba79b4210ab3bd6bc1ea38454', max_length=255),
        ),
    ]
