import {
  followingAndFollower,
  getMyFollowingIds,
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from '@/actions/profile.action';
import { getUserByClerkId } from '@/actions/user.action';
import ProfilePageClient from '@/app/profile/[username]/ProfilePageClient';
import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) return;

  return {
    title: `${user.name ?? user.name}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

async function ProfilePageServer({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) return;
  const dbUser = await getUserByClerkId(clerkUser.id);
  if (!dbUser) return;
  const user = await getProfileByUsername(username);
  if (!user) notFound();

  const myFollowingIds = await getMyFollowingIds();
  const followerObj = await getProfileByUsername(user.username).then(
    (user) => user?.followers
  );
  const followingObj = await getProfileByUsername(user.username).then(
    (user) => user?.following
  );

  const [followerId, followingId] = [
    followerObj?.map((user) => user.followerId),
    followingObj?.map((user) => user.followingId),
  ];

  const [followers, following] = await followingAndFollower(
    followerId,
    followingId
  );

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      dbUser={dbUser}
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      followers={followers}
      following={following}
      myFollowingIds={myFollowingIds}
    />
  );
}

export default ProfilePageServer;
