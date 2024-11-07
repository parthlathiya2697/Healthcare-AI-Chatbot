import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import './Profile.css';


export default function Profile({ isOpen, onClose }) {
  const [userDetails, setUserDetails] = useState({
    name: '',
    gender: '',
    birthdate: '',
    symptoms: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save user details to JSON or local storage
    console.log('User Details:', JSON.stringify(userDetails));
    onClose();
  };

  return (
    <div className={`profile-card ${isOpen ? 'open' : ''}`}>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Input name="name" placeholder="Name" value={userDetails.name} onChange={handleChange} />
          <Input name="gender" placeholder="Gender" value={userDetails.gender} onChange={handleChange} />
          <Input name="birthdate" type="date" value={userDetails.birthdate} onChange={handleChange} />
          <Input name="symptoms" placeholder="Current Symptoms/Diseases" value={userDetails.symptoms} onChange={handleChange} />
          <Input name="description" placeholder="Description" value={userDetails.description} onChange={handleChange} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={onClose}>Cancel</Button>
        </CardFooter>
      </Card>
    </div>
  );
}