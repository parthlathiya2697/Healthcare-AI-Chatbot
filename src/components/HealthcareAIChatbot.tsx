"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { MessageCircle, AlertTriangle, Hospital, User, Mic, Volume2, Star, Image as ImageIcon, ArrowUp, ArrowDown, Phone } from 'lucide-react'
import { Badge } from "../components/ui/badge"
import axios from 'axios';
import { CircularProgress } from '@mui/material';

export default function HealthcareAIChatbot() {

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Welcome to your AI Health Assistant! You've come to the right place. I've analyzed thousands of cases worldwide and I'm here to help. How can I assist you today?" }])
  const [firstAidMessages, setFirstAidMessages] = useState([])
  const [hospitalMessages, setHospitalMessages] = useState([])
  const [doctorMessages, setDoctorMessages] = useState([])
  const [chatInput, setChatInput] = useState('');
  const [firstAidInput, setFirstAidInput] = useState('');
  const [hospitalInput, setHospitalInput] = useState('');
  const [doctorInput, setDoctorInput] = useState('');
  const [isRecording, setIsRecording] = useState(false)
  const [hospitalSort, setHospitalSort] = useState('distance')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const fileInputRef = useRef(null)

  const [hospitals, setHospitals] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);


  const [firstAidReference, setFirstAidReference] = useState('');
  const [hospitalReference, setHospitalReference] = useState('');
  const [doctorReference, setDoctorReference] = useState('');

  const [base64Image, setBase64Image] = useState<string | null>(null);


  useEffect(() => {
    setFirstAidReference("I'm here to assist you in providing quick and essential first aid guidance. Whether you're dealing with minor injuries, medical emergencies, or general health concerns, I can guide you through step-by-step instructions.\n\nBefore we begin, please remember:\n\nThis chatbot is for informational purposes only.\n\nIn case of a serious or life-threatening emergency, always seek professional medical help immediately by calling your local emergency number.")
  }, [])

  useEffect(() => {
    axios.post('http://localhost:8000/api/hospitals/', {
      query: 'Some query for hospitals',
      reference_content: hospitalReference
    })
      .then(response => {
        setHospitals(response.data);
        setHospitalReference(prev => prev + ' ' + JSON.stringify(response.data));
        setIsLoadingHospitals(false);
      })
      .catch(error => {
        console.error('Error fetching hospitals:', error);
        setIsLoadingHospitals(false);
      });
  }, []);


  useEffect(() => {
    axios.post('http://localhost:8000/api/doctors/', {
      query: 'Some query for doctors',
      reference_content: doctorReference
    })
      .then(response => {
        setDoctors(response.data);
        setDoctorReference(prev => prev + ' ' + JSON.stringify(response.data));
        setIsLoadingDoctors(false);
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
        setIsLoadingDoctors(false);
      });
  }, []);

  function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }


  function handleSendMessage(e: React.FormEvent, tabContent: string = '') {
    e.preventDefault();
    if (input.trim()) {
      console.log("input: ", input, ", tabContent: ", tabContent);

      // Chat tab
      if (tabContent === 'chat') {
        setChatMessages([...chatMessages, { role: 'user', content: input }]);

        // Call the chat API endpoint
        axios.post('http://localhost:8000/api/chat/', {
          query: input,
          chat_messages: chatMessages
        }, {
          headers: {
            'X-CSRFToken': getCSRFToken() // Include CSRF token in the request headers
          }
        })
          .then(response => {
            const responseMessage = response.data.response;
            setChatMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);

          })
          .catch(error => {
            console.error('Error fetching first aid suggestions:', error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch the first aid suggestions at the moment." }]);
          });
      }


      // First aid tab
      if (tabContent === 'firstAid') {
        console.log("firstAidMessages: matched, input : ", input);
        setFirstAidMessages([...firstAidMessages, { role: 'user', content: input }]);

        // Call the first aid suggestions API with JSON input
        axios.post('http://localhost:8000/api/first-aid-suggestions/', {
          query: input,
          reference_content: firstAidReference,
          chat_messages: firstAidMessages
        })
          .then(response => {
            const responseMessage = response.data.suggestion;
            setFirstAidMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
          })
          .catch(error => {
            console.error('Error fetching first aid suggestions:', error);
            setFirstAidMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch the first aid suggestions at the moment." }]);
          });
      }


      // Hospitals tab
      if (tabContent === 'hospitals') {
        console.log("hospitalMessages: matched");
        setHospitalMessages([...hospitalMessages, { role: 'user', content: input }]);

        // Call the hospitals API with JSON input
        axios.post('http://localhost:8000/api/hospitals_suggestions/', {
          query: input,
          reference_content: hospitalReference,
          chat_messages: hospitalMessages
        })
          .then(response => {
            const responseMessage = response.data.suggestion; // Adjust based on actual response structure
            setHospitalMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
          })
          .catch(error => {
            console.error('Error fetching hospital information:', error);
            setHospitalMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch hospital information at the moment." }]);
          });
      }


      // Doctors tab
      if (tabContent === 'doctors') {
        console.log("doctorMessages: matched");
        setDoctorMessages([...doctorMessages, { role: 'user', content: input }]);

        // Call the doctors API with JSON input
        axios.post('http://localhost:8000/api/doctors_suggestions/', {
          query: input,
          reference_content: doctorReference,
          chat_messages: doctorMessages
        })
          .then(response => {
            const responseMessage = response.data.suggestion; // Adjust based on actual response structure
            setDoctorMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
          })
          .catch(error => {
            console.error('Error fetching doctor information:', error);
            setDoctorMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch doctor information at the moment." }]);
          });
      }

      setInput('');
    }
  }


  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function handleAudioInputForTab(tabContent: string) {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    if (isRecording) {
      console.log("Stopping voice recognition.");
      recognitionRef.current?.stop();
      return;
    }

    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      console.log("Voice recognition started. Speak into the microphone.");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcription: ", transcript);

      switch (tabContent) {
        case 'chat':
          setChatInput(transcript);
          break;
        case 'firstAid':
          setFirstAidInput(transcript);
          break;
        case 'hospitals':
          setHospitalInput(transcript);
          break;
        case 'doctors':
          setDoctorInput(transcript);
          break;
        default:
          break;
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error: ", event.error);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      console.log("Voice recognition ended.");
    };

    recognitionRef.current.start();
  }


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate image upload and AI analysis
      setChatMessages([...chatMessages, { role: 'user', content: `Uploaded image: ${file.name}` }]);
    }
  };

  const discardImage = () => {
    setBase64Image(null);
  };

  const playAudioGuide = () => {
    // In a real application, this would trigger audio playback
    console.log("Playing audio guide for first aid")
  }

  const sortedHospitals = [...hospitals].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    if (hospitalSort === 'distance') return (a.distance - b.distance) * order
    return (b[hospitalSort] - a[hospitalSort]) * order
  })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (

    <>
      <Card className="w-full mainC">
        <CardHeader>
          <CardTitle>AI Health Assistant</CardTitle>
          <CardDescription>Get first aid advice, find nearby hospitals, and connect with doctors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat"><MessageCircle className="w-4 h-4 mr-2" />Chat</TabsTrigger>
              <TabsTrigger value="firstAid"><AlertTriangle className="w-4 h-4 mr-2" />First Aid</TabsTrigger>
              <TabsTrigger value="hospitals"><Hospital className="w-4 h-4 mr-2" />Hospitals</TabsTrigger>
              <TabsTrigger value="doctors"><User className="w-4 h-4 mr-2" />Doctors</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                    <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <form onSubmit={(e) => handleSendMessage(e, 'chat')} className="flex items-center mt-4">
                <div className="flex items-center w-full border rounded p-2">
                  {base64Image && (
                    <div className="flex items-center mr-2">
                      <img src={base64Image} alt="Selected" className="w-8 h-8 object-cover rounded" />
                      <Button type="button" onClick={discardImage} className="ml-1">
                        ✖
                      </Button>
                    </div>
                  )}
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-grow"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} className="ml-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="sr-only">Upload image</span>
                </Button>
                <Button type="button" onClick={() => handleAudioInputForTab('chat')} className={`ml-2 ${isRecording ? 'animate-pulse' : ''}`}>
                  <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                  <span className="sr-only">Record audio</span>
                </Button>
                <Button type="submit" className="ml-2">Send</Button>
              </form>


            </TabsContent>
            <TabsContent value="firstAid">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>First Aid Guide</CardTitle>
                  <Button onClick={playAudioGuide} size="sm">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold">First AID</h3>
                  <ul className="list-disc pl-5 mt-2">
                    <li>
                      {firstAidReference}
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">Always seek professional medical help for serious injuries or if you're unsure about the severity of the situation.</p>
                </CardContent>
                <CardFooter>
                  <form onSubmit={(e) => handleSendMessage(e, 'firstAid')} className="flex items-center w-full mt-4">
                    <Input
                      type="text"
                      placeholder="Ask about first aid..."
                      value={firstAidInput}
                      onChange={(e) => setFirstAidInput(e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <Button type="button" onClick={() => handleAudioInputForTab('firstAid')} className={`ml-2 ${isRecording ? 'animate-pulse' : ''}`}>
                      <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                      <span className="sr-only">Record audio</span>
                    </Button>
                    <Button type="submit">Ask</Button>
                  </form>
                </CardFooter>
              </Card>
              {firstAidMessages.length > 0 && (
                <>
                  <br />Your chat gets displayed below<br />
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {firstAidMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                        <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </>
              )}
            </TabsContent>
            <TabsContent value="hospitals">
              {isLoadingHospitals ? (
                <div className="flex justify-center items-center h-full p-14">
                  <CircularProgress />
                </div>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Nearby Hospitals</CardTitle>
                    <div className="flex items-center">
                      <Select value={hospitalSort} onValueChange={setHospitalSort}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="distance">Distance</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="comfort">Comfort</SelectItem>
                          <SelectItem value="staff_behavior">Staff Behavior</SelectItem>
                          <SelectItem value="treatment_score">Treatment Score</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={toggleSortOrder} size="icon" variant="ghost" className="ml-2">
                        {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {sortedHospitals.map(hospital => (
                        <li key={hospital.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-100">
                          <div className={`w-3 h-3 rounded-full mt-1 ${hospital.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                          <img src={hospital.image} alt={hospital.name} className="w-24 h-16 object-cover rounded" />
                          <div className="flex-grow">
                            <h3 className="font-semibold">{hospital.name}</h3>
                            <p className="text-sm text-muted-foreground">{hospital.address}</p>
                            <p className="text-sm">Distance: {hospital.distance} km</p>
                            <div className="flex items-center mt-1 space-x-4">
                              <Badge variant="secondary" className={hospitalSort === 'rating' ? 'bg-primary text-primary-foreground' : ''}>
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span>{hospital.rating.toFixed(1)}</span>
                              </Badge>
                              <Badge variant="secondary" className={hospitalSort === 'comfort' ? 'bg-primary text-primary-foreground' : ''}>
                                Comfort: {hospital.comfort.toFixed(1)}
                              </Badge>
                              <Badge variant="secondary" className={hospitalSort === 'staff_behavior' ? 'bg-primary text-primary-foreground' : ''}>
                                Staff: {hospital.staff_behavior.toFixed(1)}
                              </Badge>
                              <Badge variant="secondary" className={hospitalSort === 'treatment_score' ? 'bg-primary text-primary-foreground' : ''}>
                                Treatment: {hospital.treatment_score.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={(e) => handleSendMessage(e, 'hospitals')} className="flex items-center w-full mt-4">
                      <Input
                        type="text"
                        placeholder="Ask about hospitals..."
                        value={hospitalInput}
                        onChange={(e) => setHospitalInput(e.target.value)}
                        className="flex-grow mr-2"
                      />

                      <Button type="button" onClick={() => handleAudioInputForTab('hospitals')} className={`ml-2 ${isRecording ? 'animate-pulse' : ''}`}>
                        <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                        <span className="sr-only">Record audio</span>
                      </Button>
                      <Button type="submit">Ask</Button>
                    </form>

                  </CardFooter>
                </Card>
              )}
              {hospitalMessages.length > 0 && (
                <>
                  <br />Your chat gets displayed below<br />
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {hospitalMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                        <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </>
              )}
            </TabsContent>
            <TabsContent value="doctors">
              {isLoadingDoctors ? (
                <div className="flex justify-center items-center h-full p-14">
                  <CircularProgress />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Available Doctors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {doctors.map(doctor => (
                        <li key={doctor.id}>
                          <Card className="mb-4">
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle>{doctor.name}</CardTitle>
                                <CardDescription>{doctor.specialty}</CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor)}
                              >
                                {selectedDoctor?.id === doctor.id ? 'Hide Details' : 'More Details'}
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-muted-foreground flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {doctor.phone}
                                </p>
                                <Badge variant="secondary">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  {doctor.rating.toFixed(1)}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Availability Today:</p>
                                <div className="flex space-x-1">
                                  {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                                    <div
                                      key={hour}
                                      className={`w-6 h-6 flex items-center justify-center text-xs ${doctor.availability.includes(hour)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                      {hour}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {selectedDoctor?.id === doctor.id && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm"><span className="font-medium">Behavior:</span> {doctor.behavior}/5</p>
                                  <p className="text-sm"><span className="font-medium">Expertise:</span> {doctor.expertise}/5</p>
                                  <p className="text-sm"><span className="font-medium">Feedback:</span> {doctor.feedbackSentiment}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <form onSubmit={(e) => handleSendMessage(e, 'doctors')} className="flex items-center w-full mt-4">
                      <Input
                        type="text"
                        placeholder="Ask about doctors..."
                        value={doctorInput}
                        onChange={(e) => setDoctorInput(e.target.value)}
                        className="flex-grow mr-2"
                      />
                      <Button type="button" onClick={() => handleAudioInputForTab('doctors')} className={`ml-2 ${isRecording ? 'animate-pulse' : ''}`}>
                        <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                        <span className="sr-only">Record audio</span>
                      </Button>
                      <Button type="submit">Ask</Button>
                    </form>
                  </CardFooter>
                </Card>
              )}
              {doctorMessages.length > 0 && (
                <>
                  <br />Your chat gets displayed below<br />
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {doctorMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                        <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          This AI assistant is for informational purposes only. Always consult with a qualified healthcare professional for medical advice.
        </CardFooter>
      </Card>
    </>
  )
}