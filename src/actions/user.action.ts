'use server';
import { User } from '@/components/UserInterface';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function syncUser() {
  try {
    const user = await currentUser();

    if (!user) return;
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    return dbUser;
  } catch (error) {
    console.log(`Error in sync`, error);
  }
}

export async function getUserByClerkId(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: id,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return;
  return user;
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error('User not found');

  return user.id;
}

export async function getRandomUsers(
  skip: number = 0,
  n: number = 3
): Promise<User[]> {
  try {
    n = n ? (n >= 3 ? n : 3) : 3;
    const userId = await getDbUserId();
    if (!userId) return [];
    // Get the list of current users follow
    const followingIds = await prisma.follows.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingUserIds = followingIds.map((f) => f.followingId);

    // Find users who are followed by someone i follow
    const mutualConnection = await prisma.user.findMany({
      where: {
        AND: [
          {
            followers: {
              some: {
                followerId: {
                  in: followingUserIds,
                },
              },
            },
          },
          {
            id: {
              notIn: followingUserIds,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const fallBackConnection = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId, // Exclude myself
            },
          },
          {
            id: {
              notIn: followingUserIds, // Exclude users i already follow
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const combinedUser = [...mutualConnection, ...fallBackConnection];
    const paginatedUsers = combinedUser.slice(skip, skip + n);
    return paginatedUsers;
  } catch (error) {
    console.log('Error while fetching random users', error);
    return [];
  }
}

export async function toggleFollow(toFollowUserId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return [];
    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
    });

    if (currentUserId == toFollowUserId)
      throw new Error('You cant follow yourself');

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: toFollowUserId,
        },
      },
    });
    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: toFollowUserId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: currentUserId,
            followingId: toFollowUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: 'FOLLOW',
            userId: toFollowUserId,
            creatorId: currentUserId,
          },
        }),
      ]);
    }
    revalidatePath('/');
    revalidatePath(`/${currentUser?.username}`);
    return true;
  } catch (error) {
    return 'There was an error';
  }
}

export async function followStatus(toFollowUserId: string): Promise<Boolean> {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;
    if (currentUserId == toFollowUserId)
      throw new Error('You cant follow yourself');

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: toFollowUserId,
        },
      },
    });
    if (existingFollow) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
