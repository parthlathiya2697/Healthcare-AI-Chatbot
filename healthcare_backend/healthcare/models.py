from django.db import models

# Create your models here.
from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    is_open = models.BooleanField(default=True)
    distance = models.FloatField()
    address = models.CharField(max_length=255)
    rating = models.FloatField()
    comfort = models.FloatField()
    staff_behavior = models.FloatField()
    treatment_score = models.FloatField()

    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    rating = models.FloatField()
    availability = models.JSONField()
    behavior = models.FloatField()
    expertise = models.FloatField()
    feedback_sentiment = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name