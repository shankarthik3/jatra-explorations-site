import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Edit, Trash2, Calendar, Users, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Experience {
  id: string;
  title: string;
  slug?: string;
  short_description?: string;
  full_description?: string;
  category: string;
  base_price: number;
  currency?: string;
  featured: boolean;
  published: boolean;
  thumbnail_url?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

const ExperienceManagement = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const categories = [
    'Agriculture',
    'Art & Craft',
    'Village Life',
    'Food',
    'EduTrip'
  ];

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    full_description: '',
    category: '',
    base_price: '',
    thumbnail_url: '',
    featured: false,
    published: false
  });

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperiences((data || []) as unknown as Experience[]);
    } catch (error: any) {
      console.error('Error loading experiences:', error);
      toast({
        title: "Error loading experiences",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createExperience = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`https://tiwfywjwapwkdnegzvhn.supabase.co/functions/v1/create-experience`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          base_price: parseFloat(formData.base_price) || 0,
          provider_id: null // For now, not linking to providers
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create experience');
      }

      toast({
        title: "Experience created",
        description: "New experience has been created successfully"
      });

      setIsDialogOpen(false);
      resetForm();
      loadExperiences();
    } catch (error: any) {
      console.error('Error creating experience:', error);
      toast({
        title: "Error creating experience",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateExperience = async (experienceId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', experienceId);

      if (error) throw error;

      setExperiences(prev => 
        prev.map(exp => exp.id === experienceId ? { ...exp, ...updates } : exp)
      );

      toast({
        title: "Experience updated",
        description: "Experience has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating experience:', error);
      toast({
        title: "Error updating experience",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;

      setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
      
      toast({
        title: "Experience deleted",
        description: "Experience has been deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error deleting experience",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      full_description: '',
      category: '',
      base_price: '',
      thumbnail_url: '',
      featured: false,
      published: false
    });
    setEditingExperience(null);
  };

  const openEditDialog = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title,
      short_description: experience.short_description,
      full_description: experience.full_description,
      category: experience.category,
      base_price: experience.base_price.toString(),
      thumbnail_url: experience.thumbnail_url,
      featured: experience.featured,
      published: experience.published
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experience Management</h1>
          <p className="text-muted-foreground">
            Create and manage cultural experiences, trips, and workshops
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? 'Edit Experience' : 'Create New Experience'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the experience. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Experience title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description for cards and previews"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_description">Full Description</Label>
                <Textarea
                  id="full_description"
                  value={formData.full_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                  placeholder="Detailed description of the experience"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_price">Price (INR)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail Image URL</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingExperience ? 
                    () => updateExperience(editingExperience.id, formData as any) :
                    createExperience
                  }
                  className="flex-1"
                >
                  {editingExperience ? 'Update Experience' : 'Create Experience'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((experience) => (
          <Card key={experience.id} className="overflow-hidden">
            {experience.thumbnail_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={experience.thumbnail_url}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">{experience.title}</CardTitle>
                  <Badge variant={experience.published ? "default" : "secondary"}>
                    {experience.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                {experience.featured && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {experience.short_description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">₹{experience.base_price}</span>
                <Badge variant="outline">{experience.category}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(experience)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteExperience(experience.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(experience.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {experiences.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first experience to get started with managing cultural trips and workshops.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Experience
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExperienceManagement;