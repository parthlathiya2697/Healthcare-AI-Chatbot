# Generated by Django 5.1.2 on 2024-10-31 04:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('healthcare', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hospital',
            name='gps_coordinates',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='hospital_type',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='hours',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='latitude',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='hospital',
            name='longitude',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='hospital',
            name='operating_hours',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='phone',
            field=models.CharField(default='', max_length=20),
        ),
        migrations.AddField(
            model_name='hospital',
            name='reviews',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='hospital',
            name='reviews_link',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='thumbnail',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='user_review',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='hospital',
            name='website',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='comfort',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='distance',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='name',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='rating',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='staff_behavior',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='hospital',
            name='treatment_score',
            field=models.FloatField(default=0.0),
        ),
    ]
