'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventService, Event } from '../../../services/eventService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    type: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    capacity: 0,
    image: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await eventService.createEvent(formData);
      router.push('/events');
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof Event, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details to create a new event</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Event Type</label>
              <Select onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">Start Time</label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">Image URL</label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/events')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 