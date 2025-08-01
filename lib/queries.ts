import { supabase } from './supabase';
import type { 
  Profile, 
  Post, 
  PostComment,
  PostWithAuthor, 
  CommentWithAuthor, 
  Connection, 
  Institution, 
  Job, 
  JobApplication, 
  JobWithCompany,
  Event, 
  EventAttendee,
  EventWithOrganizer,
  Experience, 
  Education, 
  Notification,
  ConnectionWithProfile,
  Follow,
  FollowWithProfile
} from '@/types/database.types';

// Re-export types for convenience
export type { 
  EventWithOrganizer, 
  Institution, 
  JobWithCompany, 
  Profile,
  Experience,
  Education,
  PostWithAuthor,
  ConnectionWithProfile,
  Follow,
  FollowWithProfile
};

const debugLog = (message: string, data?: unknown) => {
  console.log(`[Queries] ${message}`, data || '');
};

// Check if database schema exists
const checkSchemaExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // If we can query profiles, schema exists
    return !error;
  } catch {
    return false;
  }
};

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    debugLog('Getting profile', { userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, creating profile in auth.users');
      // Fallback to auth.users if schema doesn't exist
      return {
        id: userId,
        email: 'user@example.com',
        full_name: 'User',
        headline: 'Healthcare Professional',
        bio: '',
        location: '',
        avatar_url: '',
        banner_url: '',
        website: '',
        phone: '',
        specialization: ['General Medicine'],
        is_premium: false,
        profile_views: 0,
        user_type: 'individual',
        profile_type: 'individual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    // Try to get profile with proper error handling
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

    if (error) {
      debugLog('Error fetching profile', error);
      // If profile doesn't exist, create a basic one
      if (error.code === 'PGRST116') {
        debugLog('Profile not found, creating basic profile');
        const basicProfile: Profile = {
          id: userId,
          email: 'user@example.com',
          full_name: 'Healthcare Professional',
          headline: 'Medical Professional',
          bio: '',
          location: '',
          avatar_url: '',
          banner_url: '',
          website: '',
          phone: '',
          specialization: ['General Medicine'],
          is_premium: false,
          profile_views: 0,
          user_type: 'individual',
          profile_type: 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return basicProfile;
      }
      return null;
    }
    
    debugLog('Profile fetched successfully', data);
    return data;
  } catch (error) {
    debugLog('Error fetching profile', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    debugLog('Updating profile', { userId, updates });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot update profile');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Profile updated successfully', data);
    return data;
  } catch (error) {
    debugLog('Error updating profile', error);
    return null;
  }
}

export async function ensureProfileExists(userId: string, email: string, fullName: string): Promise<Profile | null> {
  try {
    debugLog('Ensuring profile exists', { userId, email, fullName });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning mock profile');
      return {
        id: userId,
        email,
        full_name: fullName,
        headline: 'Healthcare Professional',
        bio: '',
        location: '',
        avatar_url: '',
        banner_url: '',
        website: '',
        phone: '',
        specialization: ['General Medicine'],
        is_premium: false,
        profile_views: 0,
        user_type: 'individual',
        profile_type: 'individual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    // First try to get existing profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      
      debugLog('Profile created successfully', newProfile);
      return newProfile;
    }
    
    debugLog('Profile already exists', profile);
    return profile;
  } catch (error) {
    debugLog('Error ensuring profile exists', error);
    return null;
  }
}

// Post queries
export async function getPosts(page = 0, limit = 10): Promise<PostWithAuthor[]> {
  try {
    debugLog('Getting posts', { page, limit });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty posts');
      return [];
    }
    
    // First check if we have any posts at all
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    if (count === 0) {
      debugLog('No posts found, returning empty array');
      return [];
    }
    
    // Calculate proper offset
    const offset = Math.min(page * limit, count || 0);
    
    // Get posts without join first
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      debugLog('Error fetching posts', postsError);
      return [];
    }
    
    if (!posts || posts.length === 0) {
      debugLog('No posts returned');
      return [];
    }
    
    // Get author IDs
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    
    // Fetch authors separately
    const { data: authors, error: authorsError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, headline, email')
      .in('id', authorIds);
    
    if (authorsError) {
      debugLog('Error fetching authors', authorsError);
      // Return posts without author info
      return posts.map(post => ({
        ...post,
        author: {
          id: post.author_id,
          full_name: 'Unknown User',
          avatar_url: '',
          headline: '',
          email: ''
        }
      }));
    }
    
    // Create author lookup map
    const authorMap = new Map(authors?.map(author => [author.id, author]) || []);
    
    // Combine posts with authors
    const postsWithAuthors = posts.map(post => ({
      ...post,
      author: authorMap.get(post.author_id) || {
        id: post.author_id,
        full_name: 'Unknown User',
        avatar_url: '',
        headline: '',
        email: ''
      }
    }));
    
    debugLog('Posts fetched successfully', postsWithAuthors);
    return postsWithAuthors;
  } catch (error) {
    debugLog('Error fetching posts', error);
    return [];
  }
}

export async function getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
  try {
    debugLog('Getting posts by author', { authorId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty posts');
      return [];
    }
    
    // Get posts without join first
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (postsError) {
      debugLog('Error fetching posts by author', postsError);
      return [];
    }
    
    if (!posts || posts.length === 0) {
      debugLog('No posts found for author');
      return [];
    }
    
    // Fetch author separately
    const { data: author, error: authorError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, headline, email')
      .eq('id', authorId)
      .single();
    
    if (authorError) {
      debugLog('Error fetching author', authorError);
      // Return posts without author info
      return posts.map(post => ({
        ...post,
        author: {
          id: post.author_id,
          full_name: 'Unknown User',
          avatar_url: '',
          headline: '',
          email: ''
        }
      }));
    }
    
    // Combine posts with author
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: author || {
        id: post.author_id,
        full_name: 'Unknown User',
        avatar_url: '',
        headline: '',
        email: ''
      }
    }));
    
    debugLog('Posts by author fetched successfully', postsWithAuthor);
    return postsWithAuthor;
  } catch (error) {
    debugLog('Error fetching posts by author', error);
    return [];
  }
}

export async function createPost(post: {
  content: string;
  author_id: string;
  visibility: 'public' | 'connections' | 'private';
  image_url?: string;
  images?: string[];
}): Promise<Post | null> {
  try {
    debugLog('Creating post', post);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot create post');
      return null;
    }
    
    const postData = {
      ...post,
      author_type: 'individual' as const,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Post created successfully', data);
    return data;
  } catch (error) {
    debugLog('Error creating post', error);
    return null;
  }
}

// Connection queries
export async function getConnections(userId: string): Promise<Profile[]> {
  try {
    debugLog('Getting connections', { userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty connections');
      return [];
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        requester_id,
        recipient_id,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      debugLog('Error fetching connections', error);
      return [];
    }

    if (!data) return [];

    // Extract connected profiles
    const connections: Profile[] = [];
    for (const connection of data) {
      if (connection.requester_id === userId && connection.recipient) {
        connections.push(connection.recipient as unknown as Profile);
      } else if (connection.recipient_id === userId && connection.requester) {
        connections.push(connection.requester as unknown as Profile);
      }
    }
    
    debugLog('Connections fetched successfully', connections);
    return connections;
  } catch (error) {
    debugLog('Error fetching connections', error);
    return [];
  }
}

export async function getConnectionStatus(userId: string, targetUserId: string): Promise<string | null> {
  try {
    debugLog('Getting connection status', { userId, targetUserId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning null connection status');
      return null;
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select('status')
      .or(`and(requester_id.eq.${userId},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${userId})`)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    const status = data?.status || null;
    debugLog('Connection status fetched', status);
    return status;
  } catch (error) {
    debugLog('Error fetching connection status', error);
    return null;
  }
}

export async function sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection | null> {
  try {
    debugLog('Sending connection request', { requesterId, recipientId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot send connection request');
      return null;
    }
    
    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Connection request sent successfully', data);
    return data;
  } catch (error) {
    debugLog('Error sending connection request', error);
    return null;
  }
}

// Missing connection functions
export async function getSuggestedConnections(userId: string, limit = 10): Promise<Profile[]> {
  try {
    debugLog('Getting suggested connections', { userId, limit });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty suggested connections');
      return [];
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .limit(limit);

    if (error) {
      debugLog('Error fetching suggested connections', error);
      return [];
    }
    
    debugLog('Suggested connections fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching suggested connections', error);
    return [];
  }
}

export async function getConnectionRequests(userId: string): Promise<ConnectionWithProfile[]> {
  try {
    debugLog('Getting connection requests', { userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty connection requests');
      return [];
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    debugLog('Connection requests fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching connection requests', error);
    return [];
  }
}

export async function acceptConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    debugLog('Accepting connection request', { connectionId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot accept connection request');
      return false;
    }
    
    const { error } = await supabase
      .from('connections')
      .update({ 
        status: 'accepted', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', connectionId);

    if (error) throw error;
    
    debugLog('Connection request accepted successfully');
    return true;
  } catch (error) {
    debugLog('Error accepting connection request', error);
    return false;
  }
}

export async function rejectConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    debugLog('Rejecting connection request', { connectionId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot reject connection request');
      return false;
    }
    
    const { error } = await supabase
      .from('connections')
      .update({ 
        status: 'rejected', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', connectionId);

    if (error) throw error;
    
    debugLog('Connection request rejected successfully');
    return true;
  } catch (error) {
    debugLog('Error rejecting connection request', error);
    return false;
  }
}

// Experience queries
export async function getExperiences(profileId: string): Promise<Experience[]> {
  try {
    debugLog('Getting experiences', { profileId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty experiences');
      return [];
    }
    
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    debugLog('Experiences fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching experiences', error);
    return [];
  }
}

// Education queries
export async function getEducation(profileId: string): Promise<Education[]> {
  try {
    debugLog('Getting education', { profileId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty education');
      return [];
    }
    
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    debugLog('Education fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching education', error);
    return [];
  }
}

// Notifications - returning empty array for now due to schema issues
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    debugLog('Getting notifications (placeholder)', { userId });
    // TODO: Fix notification schema and re-enable
    return [];
  } catch (error) {
    debugLog('Error fetching notifications', error);
    return [];
  }
}

// Additional helper functions
export async function recordProfileView(viewerId: string, profileId: string): Promise<void> {
  try {
    debugLog('Recording profile view', { viewerId, profileId });
    
    if (viewerId === profileId) return; // Don't record self-views
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot record profile view');
      return;
    }
    
    await supabase
      .from('profile_views')
      .upsert({
        viewer_id: viewerId,
        profile_id: profileId,
        viewed_at: new Date().toISOString(),
      });
    
    debugLog('Profile view recorded successfully');
  } catch (error) {
    debugLog('Error recording profile view', error);
  }
}

// Comment functions
export async function createComment(comment: {
  content: string;
  post_id: string;
  author_id: string;
}): Promise<PostComment | null> {
  try {
    debugLog('Creating comment', comment);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot create comment');
      return null;
    }
    
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Comment created successfully', data);
    return data;
  } catch (error) {
    debugLog('Error creating comment', error);
    return null;
  }
}

export async function getPostComments(postId: string): Promise<CommentWithAuthor[]> {
  try {
    debugLog('Getting post comments', { postId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty comments');
      return [];
    }
    
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    debugLog('Post comments fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching post comments', error);
    return [];
  }
}

// Like functions
export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Liking post', { postId, userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot like post');
      return false;
    }
    
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    
    // Increment likes count
    await supabase.rpc('increment_likes_count', { post_id: postId });
    
    debugLog('Post liked successfully');
    return true;
  } catch (error) {
    debugLog('Error liking post', error);
    return false;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Unliking post', { postId, userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot unlike post');
      return false;
    }
    
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Decrement likes count
    await supabase.rpc('decrement_likes_count', { post_id: postId });
    
    debugLog('Post unliked successfully');
    return true;
  } catch (error) {
    debugLog('Error unliking post', error);
    return false;
  }
}

export async function isPostLiked(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Checking if post is liked', { postId, userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning false for like status');
      return false;
    }
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    const isLiked = !!data;
    debugLog('Post like status checked', isLiked);
    return isLiked;
  } catch (error) {
    debugLog('Error checking post like status', error);
    return false;
  }
}

// Institution functions
export async function createInstitution(institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>): Promise<Institution | null> {
  try {
    debugLog('Creating institution', institution);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot create institution');
      return null;
    }
    
    const { data, error } = await supabase
      .from('institutions')
      .insert({
        ...institution,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Institution created successfully', data);
    return data;
  } catch (error) {
    debugLog('Error creating institution', error);
    return null;
  }
}

export async function getInstitutions(): Promise<Institution[]> {
  try {
    debugLog('Getting institutions');
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty institutions');
      return [];
    }
    
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    debugLog('Institutions fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching institutions', error);
    return [];
  }
}

// Job functions
export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> {
  try {
    debugLog('Creating job', job);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot create job');
      return null;
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...job,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Job created successfully', data);
    return data;
  } catch (error) {
    debugLog('Error creating job', error);
    return null;
  }
}

export async function getJobs(): Promise<JobWithCompany[]> {
  try {
    debugLog('Getting jobs');
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty jobs');
      return [];
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:institutions!jobs_company_id_fkey(*),
        posted_by_user:profiles!jobs_posted_by_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    debugLog('Jobs fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching jobs', error);
    return [];
  }
}

export async function applyToJob(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication | null> {
  try {
    debugLog('Applying to job', application);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot apply to job');
      return null;
    }
    
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        ...application,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Job application submitted successfully', data);
    return data;
  } catch (error) {
    debugLog('Error applying to job', error);
    return null;
  }
}

// Event functions
export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
  try {
    debugLog('Creating event', event);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot create event');
      return null;
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Event created successfully', data);
    return data;
  } catch (error) {
    debugLog('Error creating event', error);
    return null;
  }
}

export async function getEvents(): Promise<EventWithOrganizer[]> {
  try {
    debugLog('Getting events');
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty events');
      return [];
    }
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(*)
      `)
      .order('start_date', { ascending: true });

    if (error) throw error;
    
    debugLog('Events fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching events', error);
    return [];
  }
}

export async function registerForEvent(registration: Omit<EventAttendee, 'id' | 'created_at'>): Promise<EventAttendee | null> {
  try {
    debugLog('Registering for event', registration);
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot register for event');
      return null;
    }
    
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        ...registration,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('Event registration successful', data);
    return data;
  } catch (error) {
    debugLog('Error registering for event', error);
    return null;
  }
} 

// Follow system functions
export async function followUser(followerId: string, followingId: string, followerType: 'individual' | 'student' | 'institution', followingType: 'individual' | 'student' | 'institution'): Promise<Follow | null> {
  try {
    debugLog('Following user', { followerId, followingId, followerType, followingType });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot follow user');
      return null;
    }
    
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        follower_type: followerType,
        following_type: followingType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    debugLog('User followed successfully', data);
    return data;
  } catch (error) {
    debugLog('Error following user', error);
    return null;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    debugLog('Unfollowing user', { followerId, followingId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, cannot unfollow user');
      return false;
    }
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    
    debugLog('User unfollowed successfully');
    return true;
  } catch (error) {
    debugLog('Error unfollowing user', error);
    return false;
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    debugLog('Checking if following', { followerId, followingId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning false for follow status');
      return false;
    }
    
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    const following = !!data;
    debugLog('Follow status checked', following);
    return following;
  } catch (error) {
    debugLog('Error checking follow status', error);
    return false;
  }
}

export async function getFollowers(userId: string): Promise<FollowWithProfile[]> {
  try {
    debugLog('Getting followers', { userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty followers');
      return [];
    }
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        follower:profiles!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    debugLog('Followers fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching followers', error);
    return [];
  }
}

export async function getFollowing(userId: string): Promise<FollowWithProfile[]> {
  try {
    debugLog('Getting following', { userId });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty following');
      return [];
    }
    
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        following:profiles!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    debugLog('Following fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching following', error);
    return [];
  }
}

export async function getSuggestedInstitutions(userId: string, limit: number = 10): Promise<Profile[]> {
  try {
    debugLog('Getting suggested institutions', { userId, limit });
    
    const schemaExists = await checkSchemaExists();
    if (!schemaExists) {
      debugLog('Database schema not found, returning empty suggestions');
      return [];
    }
    
    // Get institutions that the user is not already following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = following?.map(f => f.following_id) || [];
    
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('profile_type', 'institution')
      .limit(limit);
    
    if (followingIds.length > 0) {
      query = query.not('id', 'in', `(${followingIds.join(',')})`);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    debugLog('Suggested institutions fetched successfully', data);
    return data || [];
  } catch (error) {
    debugLog('Error fetching suggested institutions', error);
    return [];
  }
} 