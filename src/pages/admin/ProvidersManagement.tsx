import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Users, UserCheck } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  description: string;
  owner_profile_id: string;
  verified: boolean;
  verification_proof: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const ProvidersManagement = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          profiles:owner_profile_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      console.error('Error loading providers:', error);
      toast({
        title: "Error loading providers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProviderStatus = async (providerId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('providers')
        .update({ verified, updated_at: new Date().toISOString() })
        .eq('id', providerId);

      if (error) throw error;

      setProviders(prev => 
        prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, verified }
            : provider
        )
      );

      toast({
        title: verified ? "Provider approved" : "Provider rejected",
        description: `Provider has been ${verified ? 'approved' : 'rejected'} successfully`
      });
    } catch (error: any) {
      console.error('Error updating provider status:', error);
      toast({
        title: "Error updating provider",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  const pendingProviders = providers.filter(p => !p.verified);
  const approvedProviders = providers.filter(p => p.verified);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Providers Management</h1>
        <p className="text-muted-foreground">
          Verify and manage artisans and homestay providers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProviders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedProviders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Providers</CardTitle>
          <CardDescription>
            View and manage provider verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {provider.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {provider.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {provider.profiles?.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    {provider.profiles?.phone || 'Not provided'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={provider.verified ? "default" : "secondary"}>
                      {provider.verified ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {provider.verified ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(provider.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Provider Details</DialogTitle>
                            <DialogDescription>
                              Review provider information and verification proof
                            </DialogDescription>
                          </DialogHeader>
                          {selectedProvider && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Provider Name</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.name}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Owner</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.profiles?.full_name || 'Unknown'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Email</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.profiles?.email}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Phone</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.profiles?.phone || 'Not provided'}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedProvider.description}
                                </p>
                              </div>
                              {selectedProvider.verification_proof && (
                                <div>
                                  <h4 className="font-medium">Verification Proof</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProvider.verification_proof}
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2 pt-4">
                                {!selectedProvider.verified && (
                                  <Button
                                    onClick={() => updateProviderStatus(selectedProvider.id, true)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Provider
                                  </Button>
                                )}
                                {selectedProvider.verified && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateProviderStatus(selectedProvider.id, false)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Revoke Approval
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {!provider.verified ? (
                        <Button
                          size="sm"
                          onClick={() => updateProviderStatus(provider.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateProviderStatus(provider.id, false)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {providers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No providers found</h3>
              <p className="text-muted-foreground">
                No providers have registered yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProvidersManagement;