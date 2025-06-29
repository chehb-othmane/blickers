'use client';

import { useState, useEffect } from 'react';
import { eventService, Event, EventFilters } from '../../services/eventService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents(filters);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev: EventFilters) => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Search events..."
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
        <Select onValueChange={(value) => handleFilterChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
            <SelectItem value="meetup">Meetup</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
            <SelectItem value="Past">Past</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('sort_by', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start_date">Date (Ascending)</SelectItem>
            <SelectItem value="-start_date">Date (Descending)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                  <Badge variant={event.status === 'Upcoming' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {event.registered} / {event.capacity} registered
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 