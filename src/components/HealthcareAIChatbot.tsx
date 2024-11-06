"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { MessageCircle, AlertTriangle, Hospital, User, Mic, Volume2, Star, Image as ImageIcon, Video as VideoIcon, ArrowUp, ArrowDown, Phone, CircleX } from 'lucide-react'
import { Badge } from "../components/ui/badge"
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import VideoModal from './VideoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faCamera } from '@fortawesome/free-solid-svg-icons';
import CameraPanel from './CameraPanel'
import VideoDialog from './VideoDialog';
import ImageModal from './ImageModal';
import AudioDialog from './AudioDialog';
import ReactMarkdown from 'react-markdown';
import RequestCountDisplay from './RequestCountDisplay';

export default function HealthcareAIChatbot() {

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Welcome to your AI Health Assistant! You've come to the right place. I've analyzed thousands of cases worldwide and I'm here to help. How can I assist you today?" }
  ])
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

  const [hospitals, setHospitals] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);


  const [firstAidReference, setFirstAidReference] = useState('');
  const [hospitalReference, setHospitalReference] = useState('');
  const [doctorReference, setDoctorReference] = useState('');

  const [base64Image, setBase64Image] = useState<string | null>(null);

  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isLoadingChatFirstAid, setIsLoadingChatFirstAid] = useState(false)
  const [isLoadingChatHospitals, setIsLoadingChatHospitals] = useState(false)
  const [isLoadingChatDoctors, setIsLoadingChatDoctors] = useState(false)


  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false); // Add state for VideoDialog

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalSrc, setVideoModalSrc] = useState(''); // Add state for video modal source
  const [isCameraPanelOpen, setIsCameraPanelOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // State for controlling the image modal
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false); // State for AudioDialog
  const [currentTab, setCurrentTab] = useState('chat');

  const chatInputRef = useRef<HTMLInputElement | null>(null); // Add ref for chat input
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const firstAidScrollRef = useRef<HTMLDivElement | null>(null);
  const hospitalScrollRef = useRef<HTMLDivElement | null>(null);
  const doctorScrollRef = useRef<HTMLDivElement | null>(null);

  const [hospitalPage, setHospitalPage] = useState(1);
  const [doctorPage, setDoctorPage] = useState(1);
  const [totalHospitalPages, setTotalHospitalPages] = useState(1);
  const [totalDoctorPages, setTotalDoctorPages] = useState(1);

  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [maxRequestCount, setMaxRequestCount] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false)


  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);


  useEffect(() => {
    setFirstAidReference("I'm here to assist you in providing quick and essential first aid guidance based on your current chat in the main chat section. Whether you're dealing with minor injuries, medical emergencies, or general health concerns. I can also help you what medicines is prescribed to you and why. I can guide you through step-by-step instructions.\n\nBefore we begin, please remember:\n\nThis chatbot is for informational purposes only.\n\nIn case of a serious or life-threatening emergency, always seek professional medical help immediately by calling your local emergency number.")

    const fetchRequestData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/requestCount/`);
        const data = await response.json();
        setRequestCount(data.request_count);
        setMaxRequestCount(data.max_request_count);
      } catch (error) {
        console.error('Error fetching request data:', error);
      }
    };

    fetchRequestData();
  }, [])

  // useEffect(() => {
  //   if (hospitalReference && Array.isArray(hospitalReference)) {

  //     // Call the doctors API with the hospital names
  //     axios.post('http://localhost:8000/api/doctors/', {
  //       hospital_names: hospitalReference.map(hospital => hospital.name) // Extract hospital names
  //     })
  //       .then(response => {
  //         setDoctors(response.data);
  //         setDoctorReference(prev => prev + ' ' + JSON.stringify(response.data));
  //         setIsLoadingDoctors(false);
  //       })
  //       .catch(error => {
  //         console.error('Error fetching doctors:', error);
  //         setIsLoadingDoctors(false);
  //       });
  //   }
  // }, [hospitalReference]);


  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [chatInputRef.current]); // Add dependency on chatInputRef.current


  const fetchHospitals = useCallback((page: number) => {
    if (userLocation.latitude && userLocation.longitude) {
      setIsLoadingHospitals(true);
      axios.post('http://localhost:8000/api/hospitals/', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        page: page
      })
      .then(response => {
        setHospitals(prev => [...prev, ...response.data.hospitals]);
        setTotalHospitalPages(response.data.total_pages);
        setIsLoadingHospitals(false);
        setHospitalReference(prev => prev + ' ' + JSON.stringify(response.data));
      })
      .catch(error => {
        console.error('Error fetching hospitals:', error);
        setIsLoadingHospitals(false);
      });
    }
  }, [userLocation]);


  useEffect(() => {
    const fetchDoctors = (page: number) => {
      axios.post(`http://localhost:8000/api/doctors/?page=${page}`, {
        reference_content: doctorReference,
        hospital_names: hospitals.map(hospital => hospital.name),
        hospital_locations: hospitals.map(hospital => ({ longitude: hospital.longitude, latitude: hospital.latitude }))
      })
        .then(response => {
          const newDoctors = response.data.doctors;
          setDoctors(prev => {
            // Filter out duplicates based on doctor.id
            const existingIds = new Set(prev.map(doctor => doctor.id));
            const uniqueNewDoctors = newDoctors.filter(doctor => !existingIds.has(doctor.id));
            return [...prev, ...uniqueNewDoctors];
          });
          setTotalDoctorPages(response.data.total_pages);
          setIsLoadingDoctors(false);
        })
        .catch(error => {
          console.error('Error fetching doctors:', error);
          setIsLoadingDoctors(false);
        });
    };

    if (doctorPage <= totalDoctorPages) {
      setIsLoadingDoctors(true);
      fetchDoctors(doctorPage);
    }
  }, [hospitals, doctorPage, doctorReference]);

  useEffect(() => {
    console.log("doctors: ", doctors)
  }, [doctors])


  // useEffect(() => {
  //   axios.post('http://localhost:8000/api/doctors/', {
  //     query: 'Some query for doctors',
  //     reference_content: doctorReference
  //   })
  //     .then(response => {
  //       setDoctors(response.data);
  //       setDoctorReference(prev => prev + ' ' + JSON.stringify(response.data));
  //       setIsLoadingDoctors(false);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching doctors:', error);
  //       setIsLoadingDoctors(false);
  //     });
  // }, []);

  async function toBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const handleAudioRecorded = (audioBlob: Blob) => {
    // Handle the recorded audio blob (e.g., send it to an API or play it)
    console.log("Audio recorded:", audioBlob);
    setIsAudioDialogOpen(false); // Close the dialog after recording
  };

  const handleTextRecognized = (text: string) => {
    // Update the appropriate input based on the current tab
    switch (currentTab) { // Assuming you have a state variable to track the current tab
      case 'chat':
        setChatInput(text);
        break;
      case 'firstAid':
        setFirstAidInput(text);
        break;
      case 'hospitals':
        setHospitalInput(text);
        break;
      case 'doctors':
        setDoctorInput(text);
        break;
      default:
        break;
    }
  };

  const handleVideoRecorded = (blob: Blob) => {
    if (videoBlob) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlob)); // Revoke the old blob URL
    }
    setVideoBlob(blob);
    setIsVideoDialogOpen(false); // Close the dialog after recording
    setIsVideoModalOpen(true); // Open the video modal to show the recorded video
  };

  const handleVideoThumbnailClick = () => {
    if (videoBlob) {
      // Use window.URL.createObjectURL instead of URL.createObjectURL
      const videoUrl = window.URL.createObjectURL(videoBlob);
      setIsVideoModalOpen(true);
      setVideoModalSrc(videoUrl);
    }
  };

  const handleImageThumbnailClick = () => {
    setIsImageModalOpen(true); // Open the image modal when the thumbnail is clicked
  };

  const discardVideo = () => {
    setVideoBlob(null);
  };

  const handleCaptureImage = (imageData: string) => {
    setBase64Image(imageData);
  };

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

  async function handleSendMessage(e: React.FormEvent, tabContent: string = '') {

    e.preventDefault(); // Prevent default form submission behavior
    // return if request count exceeds the limit
    console.log("Handle send message from tab: ", tabContent)
    console.log("Request count: ", requestCount)
    console.log("Max request count: ", maxRequestCount)
    console.log("requestCount >= maxRequestCount ", requestCount >= maxRequestCount)
    if (requestCount !== null && maxRequestCount !== null && requestCount >= maxRequestCount) {
      setShowPopup(true)
      console.log("Request count exceeded the limit")
      return
    }

    e.preventDefault();
    let input = '';
    let setInput = () => { };
    let setMessages = () => { };
    let setIsLoading = () => { };
    let reference_content = () => { };
    let messages = [];

    // Determine which tab is active and set the corresponding state functions
    switch (tabContent) {
      case 'chat':
        input = chatInput;
        setInput = setChatInput;
        setMessages = setChatMessages;
        setIsLoading = setIsLoadingChat;
        reference_content = ''
        messages = chatMessages;
        break;
      case 'firstAid':
        input = firstAidInput;
        setInput = setFirstAidInput;
        setMessages = setFirstAidMessages;
        setIsLoading = setIsLoadingChatFirstAid;
        reference_content = firstAidReference
        messages = firstAidMessages;
        break;
      case 'hospitals':
        input = hospitalInput;
        setInput = setHospitalInput;
        setMessages = setHospitalMessages;
        setIsLoading = setIsLoadingChatHospitals;
        reference_content = hospitalReference
        messages = hospitalMessages;
        break;
      case 'doctors':
        input = doctorInput;
        setInput = setDoctorInput;
        setMessages = setDoctorMessages;
        setIsLoading = setIsLoadingChatDoctors;
        reference_content = doctorReference
        messages = doctorMessages;
        break;
      default:
        return;
    }

    console.log("Reference content: ", reference_content)
    console.log("Hospital Reference content: ", hospitalReference)

    if (input.trim() !== '' || base64Image || videoBlob) {
      setMessages([...messages, { role: 'user', content: input }]);
      setIsLoading(true);

      const videoBase64 = videoBlob ? await toBase64(videoBlob) : null;

      // Call the appropriate API endpoint based on the tab
      const apiEndpoint = `http://localhost:8000/api/chat_gemini/`;

      axios.post(apiEndpoint, {
        query: input,
        chat_messages: messages,
        image: base64Image,
        video: videoBase64,
        reference_content: reference_content,
      }, {
        headers: {
          'X-CSRFToken': getCSRFToken()
        }
      })
        .then(response => {
          const responseMessage = response.data.response;
          console.log(`Received ${tabContent} response:`, responseMessage);
          setMessages(prev => [...prev, { role: 'assistant', content: responseMessage.response }]);
          setFirstAidReference((responseMessage.firstaid.length > 0 && responseMessage.firstaid) || '');

          // Clear the input and image after sending
          setInput('');
          setBase64Image(null);
          setIsLoading(false);
          setRequestCount((requestCount ?? 0) + 1);

          // Scroll to the bottom of the chat area
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }

          if (chatInputRef.current) {
            chatInputRef.current.focus();
          }

          // Now get hospitals and doctors
          if (tabContent === 'chat') {
            if (userLocation.latitude && userLocation.longitude) {

              axios.post('http://localhost:8000/api/hospitals/', {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                page: hospitalPage // Include the current page in the request
              })
                .then(response => {
                  setHospitals(prev => [...prev, ...response.data.hospitals]);
                  setTotalHospitalPages(response.data.total_pages);
                  setHospitalPage(prev => prev + 1);
                  setIsLoadingHospitals(false);
                  setHospitalReference(prev => prev + ' ' + JSON.stringify(response.data));
                })
                .catch(error => {
                  console.error('Error fetching hospitals:', error);
                  setIsLoadingHospitals(false);
                });
            }
          }
        })
        .catch(error => {
          console.error(`Error fetching ${tabContent} response:`, error);
          setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I couldn't fetch the ${tabContent} response at the moment.` }]);
          setIsLoading(false);
        });
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


  // Automatically scrolls to the bottom of the chat
  const scrollToBottom = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Chat tab auto-scrolling
  useEffect(() => {
    scrollToBottom(chatScrollRef);
  }, [chatMessages]);

  // First Aid tab auto-scrolling
  useEffect(() => {
    scrollToBottom(firstAidScrollRef);
  }, [firstAidMessages]);

  // Hospitals tab auto-scrolling
  useEffect(() => {
    scrollToBottom(hospitalScrollRef);
  }, [hospitalMessages]);

  // Doctors tab auto-scrolling
  useEffect(() => {
    scrollToBottom(doctorScrollRef);
  }, [doctorMessages]);


  const loadMoreHospitals = useCallback(() => {
    if (userLocation.latitude && userLocation.longitude) {

      if (hospitalPage <= totalHospitalPages) {
        setIsLoadingHospitals(true);
        axios.post('http://localhost:8000/api/hospitals/', {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          page: hospitalPage // Include the current page in the request
        })
          .then(response => {
            setHospitals(prev => [...prev, ...response.data.hospitals]);
            setTotalHospitalPages(response.data.total_pages);
            setHospitalPage(prev => prev + 1);
            setIsLoadingHospitals(false);
            setHospitalReference(prev => prev + ' ' + JSON.stringify(response.data));
          })
          .catch(error => {
            console.error('Error fetching hospitals:', error);
            setIsLoadingHospitals(false);
          });
      }
    }
  }, [hospitalPage, totalHospitalPages]);

  // Update the loadMoreDoctors function to handle pagination
  const loadMoreDoctors = useCallback(() => {
    if (doctorPage <= totalDoctorPages) {
      setIsLoadingDoctors(true);
      axios.post(`http://localhost:8000/api/doctors/?page=${doctorPage}`, {
        hospital_names: hospitals.map(hospital => hospital.name),
        hospital_locations: hospitals.map(hospital => ({ longitude: hospital.longitude, latitude: hospital.latitude }))
      })
        .then(response => {
          const newDoctors = response.data.doctors;
          setDoctors(prev => {
            // Filter out duplicates based on doctor.id
            const existingIds = new Set(prev.map(doctor => doctor.id));
            const uniqueNewDoctors = newDoctors.filter(doctor => !existingIds.has(doctor.id));
            return [...prev, ...uniqueNewDoctors];
          });
          setTotalDoctorPages(response.data.total_pages);
          setDoctorPage(prev => prev + 1);
          setIsLoadingDoctors(false);
        })
        .catch(error => {
          console.error('Error fetching doctors:', error);
          setIsLoadingDoctors(false);
        });
    }
  }, [doctorPage, totalDoctorPages, hospitals]);

  useEffect(() => {
    loadMoreHospitals();
  }, []);

  useEffect(() => {
    if (hospitals.length > 0) {
      loadMoreDoctors();
    }
  }, [hospitals]);

  // Handle scroll event to load more hospitals
  const handleHospitalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hospitalPage < totalHospitalPages) {
      setHospitalPage(prev => prev + 1);
    }
  };



  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (currentTab === 'hospitals' && !userLocation.latitude && !userLocation.longitude) {
      getUserLocation();
    }
  }, [currentTab]);

useEffect(() => {
  if (userLocation.latitude && userLocation.longitude && hospitalPage <= totalHospitalPages) {
    fetchHospitals(hospitalPage);
  }
}, [userLocation, hospitalPage]);
  return (
    <>


      <Card className="w-full mainC">
        <RequestCountDisplay requestCount={requestCount} setRequestCount={setRequestCount} />

        <CardHeader>
          <CardTitle>AI Health Assistant</CardTitle>
          <CardDescription>Get first aid advice, find nearby hospitals, and connect with doctors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat"><MessageCircle className="w-4 h-4 mr-2" />Chat</TabsTrigger>
              <TabsTrigger value="firstAid"><AlertTriangle className="w-4 h-4 mr-2" />First Aid</TabsTrigger>
              <TabsTrigger value="hospitals"><Hospital className="w-4 h-4 mr-2" />Hospitals</TabsTrigger>
              <TabsTrigger value="doctors"><User className="w-4 h-4 mr-2" />Doctors</TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto" ref={chatScrollRef}>
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                    <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => handleSendMessage(e, 'chat')} className="flex items-center mt-4">
                <div className="flex items-start w-full border rounded p-2" style={{ minHeight: '4rem' }}> {/* Adjusted for flexible height */}
                  {isLoadingChat ? (
                    <div className="flex-grow flex justify-center items-center">
                      <CircularProgress size={24} />
                    </div>
                  ) : (
                    <div className="flex w-full"> {/* Ensure items are aligned to start */}
                      <div className="flex items-start"> {/* Align items to the start */}
                        {base64Image && (
                          <div className="relative mr-4 w-12 h-12 flex-shrink-0"> {/* Prevent shrinking */}
                            <ImageIcon className="w-4 h-4 mt-1" />
                            <div className="relative w-full h-full">
                              <img
                                src={base64Image}
                                alt="Selected"
                                className="w-full h-full object-cover rounded cursor-pointer"
                                onClick={handleImageThumbnailClick}
                              />
                              <CircleX onClick={discardImage} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', borderRadius: '100px', cursor: 'pointer' }} />
                            </div>
                          </div>
                        )}
                        {videoBlob && (
                          <div className="relative mr-4 w-12 h-12 flex-shrink-0"> {/* Prevent shrinking */}
                            <VideoIcon className="w-4 h-4 mt-1" />
                            <div className="relative w-full h-full">
                              <video
                                src={URL.createObjectURL(videoBlob)}
                                className="w-full h-full object-cover rounded cursor-pointer"
                                onClick={handleVideoThumbnailClick}
                              />
                              <CircleX onClick={discardVideo} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', borderRadius: '100px', cursor: 'pointer' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Adjusted Input Field */}
                      <div className="flex-grow ml-4">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="w-full"
                          ref={chatInputRef} // Add ref to the input
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button type="button" onClick={() => setIsCameraPanelOpen(true)} className="ml-2">
                  <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                  <span className="sr-only">Capture Image</span>
                </Button>
                <Button type="button" onClick={() => setIsAudioDialogOpen(true)} className={`ml-2`}>
                  <Mic className={`w-4 h-4`} />
                  <span className="sr-only">Record audio</span>
                </Button>
                <Button type="button" onClick={() => setIsVideoDialogOpen(true)} className="ml-2">
                  <FontAwesomeIcon icon={faVideo} className="w-4 h-4" />
                  <span className="sr-only">Record Video</span>
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
                  <ReactMarkdown>{firstAidReference}</ReactMarkdown>
                </CardContent>
                <CardFooter>
                  <form onSubmit={(e) => handleSendMessage(e, 'firstAid')} className="flex items-center w-full mt-4">
                    {isLoadingChatFirstAid ? (
                      <div className="flex-grow flex justify-center items-center">
                        <CircularProgress size={24} /> {/* Use a loading spinner */}
                      </div>
                    ) : (<Input
                      type="text"
                      placeholder="Ask about first aid..."
                      value={firstAidInput}
                      onChange={(e) => setFirstAidInput(e.target.value)}
                      className="flex-grow mr-2"
                    />)}
                    <Button type="button" onClick={() => handleAudioInputForTab('firstAid')} className={`ml-2 ${isRecording ? 'animate-pulse' : ''}`}>
                      <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                      <span className="sr-only">Record audio</span>
                    </Button>
                    <Button type="submit">Ask</Button>
                  </form>
                </CardFooter>
              </Card>
              {firstAidMessages.length > 0 && (
                <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto mt-4" ref={firstAidScrollRef}>
                  {firstAidMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                      <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="hospitals">
              {isLoadingLocation ? (
                <div className="flex justify-center items-center h-full p-14">
                  <CircularProgress />
                  <p>Loading your location...</p>
                </div>
              ) : (
                <div className="h-[700px] w-full rounded-md border p-4 overflow-y-auto" onScroll={handleHospitalScroll}>
                  {isLoadingHospitals && hospitalPage === 1 ? (
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
                          {/* <Button onClick={toggleSortOrder} size="icon" variant="ghost" className="ml-2">
                                      {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                    </Button> */}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {hospitals.map(hospital => (
                            <li key={hospital.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-100">
                              <div className={`w-3 h-3 rounded-full mt-1 ${hospital.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                              <img src={hospital.thumbnail} alt={hospital.name} className="w-24 h-16 object-cover rounded" />
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
                          {isLoadingChatHospitals && hospitalPage > 1 ? (
                            <div className="flex-grow flex justify-center items-center">
                              <CircularProgress size={24} /> {/* Use a loading spinner */}
                            </div>
                          ) : (<Input
                            type="text"
                            placeholder="Ask about hospitals..."
                            value={hospitalInput}
                            onChange={(e) => setHospitalInput(e.target.value)}
                            className="flex-grow mr-2"
                          />)}

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
                    <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto mt-4" ref={hospitalScrollRef}>
                      {hospitalMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                          <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                            <CardContent className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle>{doctor.name}</CardTitle>
                                <CardDescription>{doctor.specialty ? `${doctor.specialty} | ` : ''} <a href={doctor.hospital_website}>{doctor.hospital_name}</a></CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor)}
                              >
                                <b>{selectedDoctor?.id === doctor.id ? 'Hide Details' : 'More Details'}</b>
                              </Button>
                            </CardContent>
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
                                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                    <div
                                      key={hour}
                                      className={`w-6 h-6 flex items-center justify-center text-xs ${Array.isArray(doctor.availability) && doctor.availability.includes(hour)
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
                      {isLoadingChatDoctors ? (
                        <div className="flex-grow flex justify-center items-center">
                          <CircularProgress size={24} /> {/* Use a loading spinner */}
                        </div>
                      ) : (<Input
                        type="text"
                        placeholder="Ask about doctors..."
                        value={doctorInput}
                        onChange={(e) => setDoctorInput(e.target.value)}
                        className="flex-grow mr-2"
                      />)}
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
                <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto mt-4" ref={doctorScrollRef}>
                  {doctorMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
                      <div className={`rounded-lg p-2 max-w-[70%] ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          This AI assistant is for informational purposes only. Always consult with a qualified healthcare professional for medical advice.
        </CardFooter>
      </Card>

      {/* Camera Panel */}
      <CameraPanel
        isOpen={isCameraPanelOpen}
        onClose={() => setIsCameraPanelOpen(false)}
        onCapture={handleCaptureImage}
      />

      {/* Video Modal */}
      <VideoModal
        videoSrc={videoBlob ? URL.createObjectURL(videoBlob) : ''}
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          if (videoBlob) {
            URL.revokeObjectURL(URL.createObjectURL(videoBlob)); // Revoke the blob URL when closing
          }
        }}
      />

      {/* Video Dialog */}
      <VideoDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        onVideoRecorded={handleVideoRecorded} // Pass the handler for recorded video
      />

      {/* Image Modal */}
      <ImageModal
        imageSrc={base64Image}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      {/* Audio Dialog */}
      <AudioDialog
        isOpen={isAudioDialogOpen}
        onClose={() => setIsAudioDialogOpen(false)}
        onAudioRecorded={handleAudioRecorded}
        onTextRecognized={handleTextRecognized} // Pass the handler for recognized text
      />
      {console.log("showPopup: ", showPopup)}
      {showPopup && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 z-50 flex flex-col items-center justify-center vignette-effect">
          <span>Number of Demo Trials Expired</span> [{requestCount}/{maxRequestCount}]
          <p>Please try again tomorrow or request the Admin at plathiya2611@gmail.com</p>
          <button onClick={() => setShowPopup(false)} className="mt-2 underline">
            Dismiss
          </button>
        </div>
      )}

    </>
  );

};

