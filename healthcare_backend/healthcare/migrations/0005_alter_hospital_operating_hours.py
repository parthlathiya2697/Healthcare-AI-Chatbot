# Generated by Django 5.1.2 on 2024-10-31 04:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('healthcare', '0004_alter_hospital_operating_hours'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hospital',
            name='operating_hours',
            field=models.JSONField(default=dict),
        ),
    ]
