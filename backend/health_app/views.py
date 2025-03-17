from django.shortcuts import render
from django.db import models

# Create your views here.
# health_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from health_app.models import AppleHealthStat
import openai
from django.conf import settings

User = get_user_model()

class SleepConditionView(APIView):
    def get(self, request):
        users = User.objects.all()
        user_responses = []

        one_week_ago = timezone.now().date() - timedelta(days=7)

        for user in users[:1]:
            stats = AppleHealthStat.objects.filter(user=user, created_at__gte=one_week_ago)
            total_sleep = 0
            for stat in stats:
                for sleep in stat.sleep_analysis or []:
                    total_sleep += sleep.get('sleep_time', 0)
            total_sleep_hours = total_sleep / 3600
            if total_sleep_hours < 6 * 7:  # Less than 6 hours per day on average
                ai_response = generate_ai_response(user, total_sleep_hours)
                user_responses.append({"user": user.username, "ai_response": ai_response})

        if not user_responses:
            return Response({"message": "All users have maintained a healthy sleep schedule this week."})
        return Response(user_responses)


class StepsConditionView(APIView):
    def get(self, request):
        users = User.objects.all()
        user_responses = []

        today = timezone.now().date()

        for user in users[:1]:
            stats = AppleHealthStat.objects.filter(user=user, created_at__date=today)
            total_steps = sum(stat.step_count or 0 for stat in stats)
            if total_steps >= 10000:
                ai_response = generate_ai_response(user, total_steps)
                user_responses.append({"user": user.username, "ai_response": ai_response})

        if not user_responses:
            return Response({"message": "No users have reached 10,000 steps today."})
        return Response(user_responses)

class StepsComparisonView(APIView):
    def get(self, request):
        users = User.objects.all()
        user_responses = []

        today = timezone.now().date()
        this_week_start = today - timedelta(days=today.weekday())
        last_week_start = this_week_start - timedelta(days=7)

        for user in users[:1]:
            this_week_steps = AppleHealthStat.objects.filter(
                user=user,
                created_at__date__gte=this_week_start,
                created_at__date__lte=today
            ).aggregate(total_steps=models.Sum('step_count'))['total_steps'] or 0

            last_week_steps = AppleHealthStat.objects.filter(
                user=user,
                created_at__date__gte=last_week_start,
                created_at__date__lt=this_week_start
            ).aggregate(total_steps=models.Sum('step_count'))['total_steps'] or 0

            if last_week_steps > 0 and this_week_steps < (last_week_steps * 0.5):
                ai_response = generate_ai_response(user, this_week_steps, last_week_steps)
                user_responses.append({"user": user.username, "ai_response": ai_response})

        if not user_responses:
            return Response({"message": "No users have walked 50% less this week compared to last week."})
        return Response(user_responses)


def generate_ai_response(user, *args):
    from openai import OpenAI
    from datetime import datetime, timedelta

    client = OpenAI()

    # Define the time period for which to fetch stats, e.g., the last 7 days
    one_week_ago = datetime.now() - timedelta(days=7)
    
    # Fetch user's health stats for the defined period
    recent_stats = AppleHealthStat.objects.filter(user=user, created_at__gte=one_week_ago).order_by('created_at')
    
    # Format the data for the AI model
    formatted_stats = []
    for stat in recent_stats:
        formatted_stat = {
            "date": stat.created_at.strftime('%Y-%m-%d'),
            "step_count": stat.step_count,
            "active_energy_burned": stat.active_energy_burned,
            "flights_climbed": stat.flights_climbed,
            "heart_rate": stat.heart_rate,
            "sleep_analysis": stat.sleep_analysis,
            "basal_energy_burned": stat.basal_energy_burned,
            "active_energy_burned": stat.active_energy_burned,
            "flights_climbed": stat.flights_climbed,
            "apple_exercise_time": stat.apple_exercise_time,
            "heart_rate_variability": stat.heart_rate,
            "oxygen_saturation": stat.oxygen_saturation,
            "sleep_analysis": stat.sleep_analysis,
        }
        formatted_stats.append(formatted_stat)

    prompt = ''


    # Create a personalized message based on the condition
    if len(args) == 1 and isinstance(args[0], float):  # Sleep condition
        total_sleep_hours = args[0]
        prompt = f"Hey {user.username}, it seems like you've been sleeping less than 6 hours per night this week, totaling {total_sleep_hours:.1f} hours. That’s definitely going to make things harder. It might be worth focusing on getting more rest. Sleep is key to feeling good, so maybe tonight, try to unwind a little earlier."
    elif len(args) == 1 and isinstance(args[0], int):  # Steps 1 condition
        total_steps = args[0]
        prompt = f"Great job today, {user.username}! You crushed it with {total_steps} steps. Keep up the momentum!"
    elif len(args) == 2:  # Steps 2 condition
        this_week_steps, last_week_steps = args
        prompt = f"Hey {user.username}, looks like you’ve walked 50% less this week ({this_week_steps} steps) compared to last week ({last_week_steps} steps). It happens to all of us—some weeks are just harder. Maybe try a quick walk today to help get back into the rhythm."

    prompt += f"Here's a quick look at your activity this week: {formatted_stats}. Let's see how we can use that to keep improving."

    # Use OpenAI API to generate a more detailed response
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
        {"role": "system", "content": "You are a helpful assistant who speaks like a human friend, offering casual and supportive advice. Avoid sounding robotic or formal."},
        {"role": "user", "content": prompt + "\n\nPlease provide a personalised advice for {user.username} based on his health data, the main goal is to help the user solve a problem for bad days, and understand what helped him to be productive on good days), and analysis of their data (the analysis should include user data for a certain period and compare them with each other, and look for correlations between them)"}
        ],
        # max_tokens=500  #Todo: update this to a desired higher number
    )

    ai_message = completion.choices[0].message.content.strip()
    return ai_message
