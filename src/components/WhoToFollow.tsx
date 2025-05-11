'use client';

import { getRandomUsers } from '@/actions/user.action';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FollowButton } from './FollowButton';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export default function WhoToFollow() {
  const [skip, setSkip] = useState(0);
  const [users, setUsers] = useState<
    Array<{
      id: string;
      name: string | null;
      username: string;
      image: string | null;
      _count: {
        followers: number;
        following: number;
      };
    }>
  >([]);
  const limit = 3;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getRandomUsers(skip, limit);
        setUsers((prev) => {
          const merged = [...prev, ...data];
          const uniqueById = Array.from(
            new Map(merged.map((user) => [user.id, user])).values()
          );
          return uniqueById;
        });
        setHasMore(data.length === 3);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [skip]);

  if (users.length == 0) return;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {users.map((user, index) => (
              <motion.div
                key={`${user.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 items-center justify-between "
              >
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar>
                      <AvatarImage src={user.image || '/avatar.png'} />
                    </Avatar>
                  </Link>
                  <div className="text-xs">
                    <Link
                      href={`/profile/${user.username}`}
                      className="font-medium cursor-pointer"
                    >
                      {user.name}
                    </Link>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <p className="text-muted-foreground">
                      {user._count.followers} followers
                    </p>
                  </div>
                </div>
                <div>
                  <FollowButton userId={user.id} userName={user.name} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            onClick={() => {
              setSkip((prev) => prev + 3);
            }}
            disabled={isLoading || !hasMore}
            className="w-full justify-center"
          >
            {isLoading ? (
              <div className="flex justify-center my-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-gray-400" />
                Loading
              </div>
            ) : hasMore ? (
              <>
                <p>Show More</p>
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <p>No More User To Show</p>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
