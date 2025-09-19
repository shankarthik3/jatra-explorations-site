import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId?: string;
  marketplaceItemId?: string;
  title: string;
  price?: number;
  type: 'experience' | 'marketplace';
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  experienceId,
  marketplaceItemId,
  title,
  price,
  type
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a booking.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const bookingData = {
      user_id: user.id,
      experience_id: experienceId || null,
      marketplace_item_id: marketplaceItemId || null,
      guest_name: formData.get('guest_name') as string,
      guest_email: formData.get('guest_email') as string,
      guest_phone: formData.get('guest_phone') as string,
      number_of_persons: parseInt(formData.get('number_of_persons') as string) || 1,
      booking_date: formData.get('booking_date') as string,
      check_in_date: type === 'marketplace' ? formData.get('check_in_date') as string : null,
      check_out_date: type === 'marketplace' ? formData.get('check_out_date') as string : null,
      total_amount: price || 0,
      notes: formData.get('notes') as string,
      status: 'pending' as const
    };

    try {
      const { error } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (error) throw error;

      toast({
        title: "Booking confirmed!",
        description: "Your booking has been submitted successfully. We'll contact you soon."
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book: {title}
          </DialogTitle>
          <DialogDescription>
            Fill in your details to complete the booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest_name">Full Name *</Label>
              <Input
                id="guest_name"
                name="guest_name"
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest_email">Email *</Label>
              <Input
                id="guest_email"
                name="guest_email"
                type="email"
                required
                placeholder="Enter your email"
                defaultValue={user?.email || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest_phone">Phone Number</Label>
              <Input
                id="guest_phone"
                name="guest_phone"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number_of_persons" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Number of Persons
              </Label>
              <Input
                id="number_of_persons"
                name="number_of_persons"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
            </div>
          </div>

          {type === 'experience' ? (
            <div className="space-y-2">
              <Label htmlFor="booking_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Preferred Date
              </Label>
              <Input
                id="booking_date"
                name="booking_date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_date">Check-in Date</Label>
                <Input
                  id="check_in_date"
                  name="check_in_date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_date">Check-out Date</Label>
                <Input
                  id="check_out_date"
                  name="check_out_date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {price && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">₹{price}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requirements or requests..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;