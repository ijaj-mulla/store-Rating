import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StarRating } from '@/components/ui/star-rating';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, MapPin, Star, Store, Edit2 } from 'lucide-react';
import { mockRatings } from '@/data/mockData';
import { listAllStores, submitRating, getUserRating, getStoreRatingStats } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function StoreListingPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rows, setRows] = useState([]);
  const [userRatingsMap, setUserRatingsMap] = useState({});
  useEffect(() => {
    let mounted = true;
    listAllStores()
      .then(async (list) => {
        if (!mounted) return;
        const stats = await Promise.all(
          list.map(async (s) => {
            try {
              const { count, average } = await getStoreRatingStats(s.id);
              return { storeId: s.id, count, average };
            } catch {
              return { storeId: s.id, count: 0, average: 0 };
            }
          })
        );
        const statsMap = {};
        stats.forEach(({ storeId, count, average }) => {
          statsMap[storeId] = { totalRatings: count, averageRating: average };
        });
        const mapped = list.map((s) => ({
          id: s.id,
          name: s.name,
          address: s.address || '',
          ...statsMap[s.id],
        }));
        setRows(mapped);
        if (user?.id && mapped.length) {
          Promise.all(
            mapped.map(async (s) => {
              try {
                const r = await getUserRating(s.id);
                return { storeId: s.id, rating: r?.rating };
              } catch {
                return { storeId: s.id, rating: null };
              }
            })
          ).then((ratings) => {
            if (!mounted) return;
            const map = {};
            ratings.forEach(({ storeId, rating }) => {
              if (rating) map[storeId] = rating;
            });
            setUserRatingsMap(map);
          });
        }
      })
      .catch((err) => {
      });
    return () => { mounted = false; };
  }, [user?.id]);

  const getUserRating = (storeId) => userRatingsMap?.[storeId];

  const filteredStores = (rows || []).filter(store => {
    const query = searchQuery.toLowerCase();
    return (
      store.name.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    );
  });

  const handleOpenRatingModal = (store) => {
    const existing = getUserRating(store.id);
    setSelectedStore(store);
    setRatingValue(existing || 0);
  };

  const handleSubmitRating = async () => {
    if (!selectedStore || ratingValue === 0) return;

    setIsSubmitting(true);
    try {
      await submitRating(selectedStore.id, ratingValue);
      setUserRatingsMap(prev => ({ ...prev, [selectedStore.id]: ratingValue }));
      const { count, average } = await getStoreRatingStats(selectedStore.id);
      setRows(prev => prev.map(s => s.id === selectedStore.id ? { ...s, totalRatings: count, averageRating: average } : s));
      window.dispatchEvent(new CustomEvent('rating:submitted', { detail: { storeId: selectedStore.id } }));
      toast({ description: 'Rating submitted successfully' });
      setSelectedStore(null);
      setRatingValue(0);
    } catch (err) {
      toast({ description: err.message || 'Failed to submit rating', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="All Stores"
        description="Find and rate stores"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by store name or address..."
          className="pl-10"
        />
      </div>

      {filteredStores.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stores found"
          description="Try adjusting your search to find what you're looking for."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store, index) => {
            const userRatingValue = getUserRating(store.id);
            return (
              <div
                key={store.id}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl gradient-accent text-xl font-bold text-accent-foreground">
                    {store.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{store.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-sm truncate">{store.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Overall Rating</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={store.averageRating} size="sm" />
                      <span className="text-sm font-semibold">{store.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {store.totalRatings} reviews
                    </p>
                  </div>

                  {userRatingValue && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Your Rating</p>
                      <div className="mt-1 flex items-center gap-1 justify-end">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{userRatingValue}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className={cn(
                    'mt-4 w-full',
                    userRatingValue
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'gradient-primary text-primary-foreground'
                  )}
                  onClick={() => handleOpenRatingModal(store)}
                >
                  {userRatingValue ? (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Rating
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Rate Store
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getUserRating(selectedStore?.id || '') ? 'Edit Your Rating' : 'Rate This Store'}
            </DialogTitle>
          </DialogHeader>

          {selectedStore && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-accent text-xl font-bold text-accent-foreground">
                  {selectedStore.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedStore.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStore.address}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 rounded-lg bg-muted/50 p-6">
                <p className="text-sm text-muted-foreground">Tap a star to rate</p>
                <StarRating
                  rating={ratingValue}
                  size="lg"
                  interactive
                  onRatingChange={setRatingValue}
                />
                <p className="text-2xl font-bold">
                  {ratingValue > 0 ? ratingValue : '-'} / 5
                </p>
              </div>

              {ratingValue === 0 && (
                <p className="text-center text-sm text-destructive">
                  Please select a rating between 1 and 5
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedStore(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={ratingValue === 0 || isSubmitting}
              className="gradient-primary text-primary-foreground"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
