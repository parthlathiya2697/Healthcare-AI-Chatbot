# health_app/management/commands/generate_random_data.py
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from health_app.models import AppleHealthStat
from django.utils import timezone
from datetime import timedelta, datetime

class Command(BaseCommand):
    help = 'Generate random AppleHealthStat data for users'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Create sample users
        for i in range(10):
            user, created = User.objects.get_or_create(username=f'user{i}')
            if created:
                user.set_password('password123')
                user.save()

            # Generate random AppleHealthStat data for the past 14 days
            for day in range(14):
                date = timezone.now().date() - timedelta(days=day)
                sleep_analysis = self.generate_sleep_data(date)
                AppleHealthStat.objects.create(
                    user=user,
                    date_of_birth=datetime.strptime(f'198{random.randint(0, 9)}-0{random.randint(1,9)}-{random.randint(10,28)}', '%Y-%m-%d'),
                    height=random.randint(150, 200),
                    body_mass=random.randint(50, 100),
                    body_fat_percentage=random.randint(10, 30),
                    biological_sex=random.choice(['male', 'female']),
                    activity_move_mode=random.choice(['activeEnergy', 'walking', 'running']),
                    step_count=random.randint(0, 20000),
                    basal_energy_burned=random.randint(1000, 2000),
                    active_energy_burned=random.randint(200, 800),
                    flights_climbed=random.randint(0, 20),
                    apple_exercise_time=random.randint(0, 120),
                    apple_move_time=random.randint(0, 120),
                    apple_stand_hour=random.randint(0, 24),
                    menstrual_flow=random.choice(['unspecified', 'light', 'medium', 'heavy']) if random.choice([True, False]) else None,
                    hk_workout_type_identifier=None,
                    heart_rate=random.randint(60, 100),
                    oxygen_saturation=random.randint(90, 100),
                    mindful_session={},
                    sleep_analysis=sleep_analysis,
                )

        self.stdout.write(self.style.SUCCESS('Random data generated successfully.'))

    def generate_sleep_data(self, date):
        sleep_periods = []
        total_sleep_time = random.randint(4*3600, 9*3600)  # between 4 to 9 hours
        current_time = datetime.combine(date, datetime.min.time()) + timedelta(hours=22)  # Sleep starts around 10 PM
        while total_sleep_time > 0:
            sleep_time = random.randint(15*60, 2*3600)  # Sleep intervals between 15 min to 2 hours
            sleep_periods.append({
                "date": current_time.strftime('%Y-%m-%d %H:%M'),
                "sleep_time": sleep_time
            })
            total_sleep_time -= sleep_time
            current_time += timedelta(seconds=sleep_time + random.randint(5*60, 30*60))  # Awake time between intervals
        return sleep_periods
