import Head from 'next/head';
import HealthcareAIChatbot from '@/components/HealthcareAIChatbot';

export default function Home() {
  return (
    <>
      <Head>
        <title>Healthcare AI Chatbot</title>
      </Head>
      <h2 style={{ fontSize: '4rem', color: 'white', textAlign: 'center'}} className="p-7">
        Healthcare AI Chatbot
      </h2>
      <main className="flex min-h-screen flex-col items-center justify-between p-7">
        <HealthcareAIChatbot />
      </main>
    </>
  );
}