from django.db import models
class Hospital(models.Model):
    name = models.CharField(max_length=255, default='')
    address = models.CharField(max_length=255)
    longitude = models.FloatField(default=0.0)
    latitude = models.FloatField(default=0.0)
    gps_coordinates = models.CharField(max_length=255, default='')
    rating = models.FloatField(default=0.0)
    reviews = models.IntegerField(default=0)
    reviews_link = models.CharField(max_length=255, default='')
    hospital_type = models.CharField(max_length=255, default='')
    is_open = models.BooleanField(default=True)
    comfort = models.FloatField(default=0.0)
    hours = models.CharField(max_length=255, default='')
    operating_hours = models.JSONField(default=dict)
    phone = models.CharField(max_length=20, default='')
    website = models.CharField(max_length=255, default='')
    user_review = models.CharField(max_length=255, default='')
    thumbnail = models.CharField(max_length=255, default='')

    staff_behavior = models.FloatField(default=0.0)
    treatment_score = models.FloatField(default=0.0)
    distance = models.FloatField(default=0.0)



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
