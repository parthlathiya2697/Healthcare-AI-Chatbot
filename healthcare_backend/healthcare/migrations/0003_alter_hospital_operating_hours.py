# Generated by Django 5.1.2 on 2024-10-31 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('healthcare', '0002_hospital_gps_coordinates_hospital_hospital_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hospital',
            name='operating_hours',
            field=models.JSONField(default={}),
        ),
    ]
