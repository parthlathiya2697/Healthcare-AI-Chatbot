"use client"

import React, { useState, useRef } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { MessageCircle, AlertTriangle, Hospital, User, Mic, Volume2, Star, Image as ImageIcon, ArrowUp, ArrowDown, Phone } from 'lucide-react'
import { Badge } from "../components/ui/badge"

// Simulated data
const hospitals = [
  { id: 1, name: "Central Hospital", isOpen: true, distance: 2.5, address: "123 Main St, Cityville", rating: 4.5, comfort: 4.2, staffBehavior: 4.7, treatmentScore: 4.6, image: "/placeholder.svg?height=100&width=200" },
  { id: 2, name: "City Clinic", isOpen: false, distance: 1.8, address: "456 Oak Ave, Townsburg", rating: 4.2, comfort: 4.0, staffBehavior: 4.5, treatmentScore: 4.3, image: "/placeholder.svg?height=100&width=200" },
  { id: 3, name: "Community Health Center", isOpen: true, distance: 3.2, address: "789 Pine Rd, Villageton", rating: 4.8, comfort: 4.5, staffBehavior: 4.9, treatmentScore: 4.7, image: "/placeholder.svg?height=100&width=200" },
]

const doctors = [
  { id: 1, name: "Dr. Jane Smith", specialty: "Emergency Medicine", rating: 4.8, availability: [9, 10, 11, 14, 15, 16], behavior: 4.9, expertise: 4.8, feedbackSentiment: "Highly Positive", phone: "+1 (555) 123-4567" },
  { id: 2, name: "Dr. John Doe", specialty: "General Practice", rating: 4.5, availability: [10, 11, 12, 13, 14], behavior: 4.6, expertise: 4.7, feedbackSentiment: "Positive", phone: "+1 (555) 987-6543" },
  { id: 3, name: "Dr. Emily Brown", specialty: "Pediatrics", rating: 4.9, availability: [9, 10, 11, 12, 15, 16, 17], behavior: 5.0, expertise: 4.9, feedbackSentiment: "Extremely Positive", phone: "+1 (555) 246-8135" },
]

export default function HealthcareAIChatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to your AI Health Assistant! You've come to the right place. I've analyzed thousands of cases worldwide and I'm here to help. How can I assist you today?" }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [hospitalSort, setHospitalSort] = useState('distance')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const fileInputRef = useRef(null)

  const handleSendMessage = (e: React.FormEvent, tabContent: string = '') => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      // Simulate AI response (in a real app, this would call an API)
      setTimeout(() => {
        let response = "I understand your concern. Based on the information you've provided, here's my advice: "
        if (tabContent === 'firstAid') {
          response += "For minor cuts, clean the wound with soap and water, apply antibiotic ointment, and cover with a sterile bandage. If bleeding is severe or doesn't stop after 10 minutes of direct pressure, seek immediate medical attention."
        } else if (tabContent === 'doctors') {
          response += "Dr. Jane Smith, our emergency medicine specialist, is available today at 2 PM and 3 PM. She has excellent reviews for her expertise in handling urgent cases."
        } else if (tabContent === 'hospitals') {
          response += "The nearest open hospital is Central Hospital, 2.5 km away. It has high ratings for staff behavior and treatment quality. Would you like more details about this hospital?"
        } else {
          response += "If you're experiencing any medical symptoms, please describe them in detail. I can provide general advice or direct you to appropriate resources."
        }
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }, 1000)
      setInput('')
    }
  }

  const handleAudioInput = () => {
    setIsRecording(true)
    // Simulating audio recording and transcription
    setTimeout(() => {
      setIsRecording(false)
      setInput("I have a severe headache and feeling dizzy.")
    }, 3000)
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate image upload and AI analysis
      setMessages([...messages, { role: 'user', content: `Uploaded image: ${file.name}` }])
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: "I've analyzed the image you sent. It appears to show symptoms of a mild skin rash. Based on the visible symptoms, it could be contact dermatitis. I recommend applying a cool compress and using an over-the-counter hydrocortisone cream. If the rash persists or worsens after 48 hours, please consult a dermatologist." }])
      }, 1500)
    }
  }

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
    <Card className="w-full max-w-4xl mx-auto">
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
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                  <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex items-center mt-4">
              <Input 
                type="text" 
                placeholder="Type your message..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow mr-2"
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <Button type="button" onClick={handleImageUpload} className="mr-2">
                <ImageIcon className="w-4 h-4" />
                <span className="sr-only">Upload image</span>
              </Button>
              <Button type="button" onClick={handleAudioInput} className="mr-2">
                <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                <span className="sr-only">Record audio</span>
              </Button>
              <Button type="submit">Send</Button>
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
                <h3 className="text-lg font-semibold">Common Emergency Situations:</h3>
                <ul className="list-disc pl-5 mt-2">
                  <li>Cuts and Scrapes: Clean the wound with soap and water, apply antibiotic ointment, and cover with a sterile bandage.</li>
                  <li>Burns: Run cool water over the burn for at least 10 minutes. Cover with a clean, dry dressing.</li>
                  
                  <li>Sprains: Remember RICE - Rest, Ice, Compression, and Elevation.</li>
                  <li>Choking: Perform the Heimlich maneuver if the person can't cough, speak, or breathe.</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">Always seek professional medical help for serious injuries or if you're unsure about the severity of the situation.</p>
              </CardContent>
              <CardFooter>
                <form onSubmit={(e) => handleSendMessage(e, 'firstAid')} className="flex items-center w-full mt-4">
                  <Input 
                    type="text" 
                    placeholder="Ask about first aid..." 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button type="submit">Ask</Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="hospitals">
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
                      <SelectItem value="staffBehavior">Staff Behavior</SelectItem>
                      <SelectItem value="treatmentScore">Treatment Score</SelectItem>
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
                          <Badge variant="secondary" className={hospitalSort === 'staffBehavior' ? 'bg-primary text-primary-foreground' : ''}>
                            Staff: {hospital.staffBehavior.toFixed(1)}
                          </Badge>
                          <Badge variant="secondary" className={hospitalSort === 'treatmentScore' ? 'bg-primary text-primary-foreground' : ''}>
                            Treatment: {hospital.treatmentScore.toFixed(1)}
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
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button type="submit">Ask</Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="doctors">
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
                                  className={`w-6 h-6 flex items-center justify-center text-xs ${
                                    doctor.availability.includes(hour)
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
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button type="submit">Ask</Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This AI assistant is for informational purposes only. Always consult with a qualified healthcare professional for medical advice.
      </CardFooter>
    </Card>
  )
}