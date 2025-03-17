'use client'

import { useEffect, useState } from 'react';
import { getSleepCondition, getStepsCondition, getStepsComparison } from '../app/apiService';

export default function Home() {
  const [sleepData, setSleepData] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    console.log('Sleep Data:', sleepData);
    console.log('Steps Data:', stepsData);
    console.log('Comparison Data:', comparisonData);
  }, [sleepData, stepsData, comparisonData]);

  useEffect(() => {
    const fetchData = async () => {
      const sleep = await getSleepCondition();
      const steps = await getStepsCondition();
      const comparison = await getStepsComparison();
      setSleepData(Array.isArray(sleep) ? sleep : []);
      setStepsData(Array.isArray(steps) ? steps : []);
      setComparisonData(Array.isArray(comparison) ? comparison : []);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>AI Health Project</h1>
      
      <section>
        <h2>Sleep Condition</h2>
        <ul>
          {Array.isArray(sleepData) && stepsData.length > 0 ? sleepData.map(({ user, ai_response }, index) => (
            <li key={index}>{user}: {ai_response}</li>
          )):
            <p>No sleep condition data available</p>
          }
        </ul>
      </section>

      <section>
        <h2>Steps Condition</h2>
        <ul>
          {Array.isArray(stepsData) && stepsData.length > 0 ? (
            stepsData.map(({ user, ai_response }, index) => (
              <li key={index}>{user}: {ai_response}</li>
            ))
          ) : (
            <p>No steps data available.</p>
          )}
        </ul>
      </section>

      <section>
        <h2>Steps Comparison</h2>
        <ul>
          {Array.isArray(comparisonData) && comparisonData.length > 0 ? comparisonData.map(({ user, ai_response }, index) => (
            <li key={index}>{user}: {ai_response}</li>
          )):
            <p>No comparison data available</p>
            }
        </ul>
      </section>
    </div>
  );
}