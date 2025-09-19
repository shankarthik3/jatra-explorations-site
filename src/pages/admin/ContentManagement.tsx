import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Save, Upload, Image } from 'lucide-react';

interface CMSText {
  key: string;
  value: string;
  last_updated: string;
}

const ContentManagement = () => {
  const [cmsTexts, setCmsTexts] = useState<CMSText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Load CMS content
  useEffect(() => {
    loadCMSContent();
  }, []);

  const loadCMSContent = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_texts')
        .select('*')
        .order('key');

      if (error) throw error;
      setCmsTexts(data || []);
    } catch (error: any) {
      console.error('Error loading CMS content:', error);
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCMSText = async (key: string, value: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('cms_texts')
        .upsert({ key, value, last_updated: new Date().toISOString() });

      if (error) throw error;

      setCmsTexts(prev => 
        prev.map(item => 
          item.key === key 
            ? { ...item, value, last_updated: new Date().toISOString() }
            : item
        )
      );

      toast({
        title: "Content updated",
        description: `${key} has been updated successfully`
      });
    } catch (error: any) {
      console.error('Error updating CMS text:', error);
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!session?.access_token) return null;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'public-media');

      const response = await fetch(`https://tiwfywjwapwkdnegzvhn.supabase.co/functions/v1/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully"
      });

      return result.url;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, cmsKey: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      await updateCMSText(cmsKey, imageUrl);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const textSections = [
    { key: 'homepage.hero.title', label: 'Homepage Hero Title', type: 'text' },
    { key: 'homepage.hero.subtitle', label: 'Homepage Hero Subtitle', type: 'textarea' },
    { key: 'homepage.about.title', label: 'About Section Title', type: 'text' },
    { key: 'homepage.about.description', label: 'About Section Description', type: 'textarea' },
    { key: 'experiences.title', label: 'Experiences Section Title', type: 'text' },
    { key: 'marketplace.title', label: 'Marketplace Section Title', type: 'text' },
  ];

  const imageSections = [
    { key: 'homepage.hero.background', label: 'Hero Background Image' },
    { key: 'homepage.about.image', label: 'About Section Image' },
    { key: 'homepage.banner.image', label: 'Homepage Banner' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Edit website content, upload images, and manage site copy
        </p>
      </div>

      {/* Text Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Text Content
          </CardTitle>
          <CardDescription>
            Edit headlines, descriptions, and other text content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {textSections.map((section) => {
            const cmsItem = cmsTexts.find(item => item.key === section.key);
            return (
              <div key={section.key} className="space-y-2">
                <Label htmlFor={section.key}>{section.label}</Label>
                {section.type === 'textarea' ? (
                  <Textarea
                    id={section.key}
                    value={cmsItem?.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCmsTexts(prev => {
                        const exists = prev.find(item => item.key === section.key);
                        if (exists) {
                          return prev.map(item => 
                            item.key === section.key ? { ...item, value } : item
                          );
                        } else {
                          return [...prev, { key: section.key, value, last_updated: new Date().toISOString() }];
                        }
                      });
                    }}
                    onBlur={() => {
                      const value = cmsTexts.find(item => item.key === section.key)?.value || '';
                      if (value !== cmsItem?.value) {
                        updateCMSText(section.key, value);
                      }
                    }}
                    rows={3}
                    placeholder={`Enter ${section.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={section.key}
                    value={cmsItem?.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCmsTexts(prev => {
                        const exists = prev.find(item => item.key === section.key);
                        if (exists) {
                          return prev.map(item => 
                            item.key === section.key ? { ...item, value } : item
                          );
                        } else {
                          return [...prev, { key: section.key, value, last_updated: new Date().toISOString() }];
                        }
                      });
                    }}
                    onBlur={() => {
                      const value = cmsTexts.find(item => item.key === section.key)?.value || '';
                      if (value !== cmsItem?.value) {
                        updateCMSText(section.key, value);
                      }
                    }}
                    placeholder={`Enter ${section.label.toLowerCase()}`}
                  />
                )}
                {cmsItem?.last_updated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(cmsItem.last_updated).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Image Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image Management
          </CardTitle>
          <CardDescription>
            Upload and manage images for banners, backgrounds, and content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {imageSections.map((section) => {
            const cmsItem = cmsTexts.find(item => item.key === section.key);
            return (
              <div key={section.key} className="space-y-4">
                <Label>{section.label}</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={cmsItem?.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCmsTexts(prev => {
                          const exists = prev.find(item => item.key === section.key);
                          if (exists) {
                            return prev.map(item => 
                              item.key === section.key ? { ...item, value } : item
                            );
                          } else {
                            return [...prev, { key: section.key, value, last_updated: new Date().toISOString() }];
                          }
                        });
                      }}
                      onBlur={() => {
                        const value = cmsTexts.find(item => item.key === section.key)?.value || '';
                        if (value !== cmsItem?.value) {
                          updateCMSText(section.key, value);
                        }
                      }}
                      placeholder="Image URL"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, section.key)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button variant="outline" disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
                {cmsItem?.value && (
                  <div className="relative">
                    <img
                      src={cmsItem.value}
                      alt={section.label}
                      className="w-full max-w-sm h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;