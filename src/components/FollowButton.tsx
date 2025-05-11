'use client';

import { followStatus, toggleFollow } from '@/actions/user.action';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from './ui/button';

export function FollowButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<Boolean>();
  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleFollow(userId);
      isFollowing
        ? toast.success(`Unfollowed ${userName}`)
        : toast.success(`Followed ${userName}`);
    } catch (error) {
      isFollowing
        ? toast.error(`Couldnt Unfollow ${userName}`)
        : toast.error(`Couldnt Follow ${userName}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      setIsFollowing(await followStatus(userId));
    };
    checkFollowStatus();
  }, [isFollowing, handleFollow]);
  return (
    <Button
      size={'sm'}
      variant={'secondary'}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
