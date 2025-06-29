'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eventService, Event } from '../../../services/eventService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/outline";

interface EventDetailsPageProps {
  params: {
    id: string;
  };
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [params.id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvent(parseInt(params.id));
      setEvent(data);
      setError(null);
    } catch (err) {
      setError('Failed to load event details. Please try again later.');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    try {
      setRegistering(true);
      await eventService.registerForEvent(event.id);
      await loadEvent(); // Reload event to update registration count
    } catch (err) {
      setError('Failed to register for event. Please try again.');
      console.error('Error registering for event:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    try {
      setRegistering(true);
      await eventService.unregisterFromEvent(event.id);
      await loadEvent(); // Reload event to update registration count
    } catch (err) {
      setError('Failed to unregister from event. Please try again.');
      console.error('Error unregistering from event:', err);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const isFull = event.registered >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{event.title}</CardTitle>
              <CardDescription className="mt-2">{event.description}</CardDescription>
            </div>
            <Badge variant={event.status === 'Upcoming' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>{event.date} at {event.time}</span>
                {event.endTime && <span> - {event.endTime}</span>}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UsersIcon className="h-5 w-5 mr-2" />
                <span>{event.registered} / {event.capacity} registered</span>
              </div>
            </div>
            {event.image && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/events')}
          >
            Back to Events
          </Button>
          {!isPast && (
            <Button
              onClick={isFull ? handleUnregister : handleRegister}
              disabled={registering}
            >
              {registering
                ? 'Processing...'
                : isFull
                ? 'Unregister'
                : 'Register Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 