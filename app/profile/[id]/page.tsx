'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import { cn, formatDate } from '@/lib/utils';
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  getProfile,
  recordProfileView,
  getConnectionStatus,
  sendConnectionRequest,
  getExperiences,
  getEducation,
  getPostsByAuthor,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
} from '@/lib/queries';

// Memoized components for better performance
const ProfileHeader = React.memo(function ProfileHeader({ profile, isOwnProfile, connectionStatus, onConnect }: {
  profile: Profile;
  isOwnProfile: boolean;
  connectionStatus: string;
  onConnect: () => void;
}) {
  return (
  <div className="relative">
    {/* Banner */}
    <div className="h-48 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-t-xl overflow-hidden">
      {profile.banner_url ? (
        <img
          src={profile.banner_url}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
      )}
    </div>

    {/* Profile Info */}
    <div className="relative px-6 pb-6">
      {/* Avatar */}
      <div className="absolute -top-16 left-6">
        <Avatar
          src={profile.avatar_url}
          alt={profile.full_name || 'User'}
          size="2xl"
          className="ring-4 ring-white shadow-xl bg-white"
        />
        {profile.is_premium && (
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white">
            <CheckBadgeIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 space-x-3">
        {!isOwnProfile && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white"
            >
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white"
            >
              <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              onClick={onConnect}
              disabled={connectionStatus === 'pending' || connectionStatus === 'connected'}
              className="modern-button-primary shadow-lg"
              size="sm"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'pending' ? 'Pending' : 'Connect'}
            </Button>
          </>
        )}
        
        {isOwnProfile && (
          <Button className="modern-button-primary shadow-lg" size="sm">
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Details */}
      <div className="mt-16">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.full_name || 'Anonymous User'}
          </h1>
          {profile.is_premium && (
            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
              Premium
            </span>
          )}
        </div>
        
        {profile.headline && (
          <p className="text-lg text-slate-600 mb-4">{profile.headline}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
          {profile.location && (
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {profile.location}
            </div>
          )}
          <div className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            {profile.profile_views || 0} profile views
          </div>
        </div>

        {profile.bio && (
          <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
        )}
      </div>
    </div>
  </div>
  );
});

const ContactInfo = React.memo(function ContactInfo({ profile }: { profile: Profile }) {
  return (
  <Card className="modern-card">
    <CardHeader>
      <CardTitle className="text-lg text-slate-900">Contact Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {profile.email && (
        <div className="flex items-center text-sm">
          <EnvelopeIcon className="w-4 h-4 mr-3 text-slate-400" />
          <span className="text-slate-600">Email:</span>
          <span className="ml-2 text-slate-900">{profile.email}</span>
        </div>
      )}
      {profile.phone && (
        <div className="flex items-center text-sm">
          <PhoneIcon className="w-4 h-4 mr-3 text-slate-400" />
          <span className="text-slate-600">Phone:</span>
          <span className="ml-2 text-slate-900">{profile.phone}</span>
        </div>
      )}
      {profile.website && (
        <div className="flex items-center text-sm">
          <GlobeAltIcon className="w-4 h-4 mr-3 text-slate-400" />
          <span className="text-slate-600">Website:</span>
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary-600 hover:underline"
          >
            {profile.website}
          </a>
        </div>
      )}
         </CardContent>
   </Card>
  );
});

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('about');
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');

  const profileId = params.id as string;
  const isOwnProfile = user?.id === profileId;

  // Debug logging
  const debugLog = useCallback((message: string, data?: unknown) => {
    console.log(`[ProfilePage] ${message}`, data);
  }, []);

  // Memoized data fetching functions
  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    debugLog('Fetching profile data', { profileId });

    try {
      const [profileData, experiencesData, educationData, postsData] = await Promise.all([
        getProfile(profileId),
        getExperiences(profileId),
        getEducation(profileId),
        getPostsByAuthor(profileId),
      ]);

      if (!profileData) {
        debugLog('Profile not found', { profileId });
        toast.error('Profile not found');
        router.push('/feed');
        return;
      }

      setProfile(profileData);
      setExperiences(experiencesData);
      setEducation(educationData);
      setPosts(postsData);

      // Record profile view if not own profile
      if (!isOwnProfile && user?.id) {
        await recordProfileView(profileId, user.id);
      }

      // Get connection status if not own profile
      if (!isOwnProfile && user?.id) {
        const status = await getConnectionStatus(user.id, profileId);
        setConnectionStatus((status as 'none' | 'pending' | 'connected') || 'none');
      }

      debugLog('Profile data loaded successfully', {
        profile: profileData,
        experiencesCount: experiencesData.length,
        educationCount: educationData.length,
        postsCount: postsData.length,
      });
    } catch (error) {
      debugLog('Error fetching profile data', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [profileId, isOwnProfile, user?.id, debugLog, router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleConnect = useCallback(async () => {
    if (!user?.id || !profileId) {
      toast.error('Please log in to connect with others');
      return;
    }

    debugLog('Sending connection request', { fromUserId: user.id, toUserId: profileId });

    try {
      const success = await sendConnectionRequest(user.id, profileId);
      if (success) {
        setConnectionStatus('pending');
        toast.success('Connection request sent!');
        debugLog('Connection request sent successfully');
      } else {
        toast.error('Failed to send connection request');
        debugLog('Failed to send connection request');
      }
    } catch (error) {
      debugLog('Error sending connection request', error);
      toast.error('Failed to send connection request');
    }
  }, [user?.id, profileId, debugLog]);

  // Memoized section navigation
  const sections = useMemo(() => [
    { id: 'about', label: 'About', icon: UserPlusIcon },
    { id: 'experience', label: 'Experience', icon: BriefcaseIcon },
    { id: 'education', label: 'Education', icon: AcademicCapIcon },
    { id: 'activity', label: 'Activity', icon: CalendarIcon },
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-slate-200 rounded-t-xl mb-4"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen modern-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/feed')} className="modern-button-primary">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/feed')}
            className="text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="modern-card overflow-hidden"
            >
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                connectionStatus={connectionStatus}
                onConnect={handleConnect}
              />
            </motion.div>

            {/* Specializations */}
            {profile.specialization && profile.specialization.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Specialization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialization.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Section Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="modern-card">
                <CardContent className="p-0">
                  <div className="flex border-b border-slate-200">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2',
                          activeSection === section.id
                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <section.icon className="w-4 h-4" />
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {activeSection === 'about' && (
                <Card className="modern-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.bio ? (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-slate-500 italic">No bio available</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Experience</h3>
                  {experiences.length > 0 ? (
                    experiences.map((exp) => (
                      <Card key={exp.id} className="modern-card">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <BriefcaseIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                              <p className="text-primary-600 font-medium">{exp.company}</p>
                              {exp.location && (
                                <p className="text-sm text-slate-500">{exp.location}</p>
                              )}
                                                             <p className="text-sm text-slate-500 mt-1">
                                 {formatDate(exp.start_date)} - {exp.current ? 'Present' : (exp.end_date ? formatDate(exp.end_date) : 'Present')}
                               </p>
                              {exp.description && (
                                <p className="text-slate-700 mt-2 text-sm">{exp.description}</p>
                              )}
                              {exp.specialization && exp.specialization.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.specialization.map((spec, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="modern-card">
                      <CardContent className="p-6 text-center text-slate-500">
                        No experience added yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === 'education' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Education</h3>
                  {education.length > 0 ? (
                    education.map((edu) => (
                      <Card key={edu.id} className="modern-card">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <AcademicCapIcon className="w-6 h-6 text-slate-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                              <p className="text-primary-600 font-medium">{edu.school}</p>
                              {edu.field && (
                                <p className="text-sm text-slate-600">{edu.field}</p>
                              )}
                              {edu.specialization && (
                                <p className="text-sm text-slate-600">Specialization: {edu.specialization}</p>
                              )}
                                                             <p className="text-sm text-slate-500 mt-1">
                                 {formatDate(edu.start_date)} - {edu.current ? 'Present' : (edu.end_date ? formatDate(edu.end_date) : 'Present')}
                               </p>
                              {edu.gpa && (
                                <p className="text-sm text-slate-500">GPA: {edu.gpa}</p>
                              )}
                              {edu.honors && edu.honors.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {edu.honors.map((honor, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs"
                                    >
                                      {honor}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="modern-card">
                      <CardContent className="p-6 text-center text-slate-500">
                        No education added yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post.id} className="modern-card">
                        <CardContent className="p-6">
                          <p className="text-slate-700 mb-3">{post.content}</p>
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>{formatDate(post.created_at)}</span>
                            <div className="flex items-center space-x-4">
                              <span>{post.likes_count} likes</span>
                              <span>{post.comments_count} comments</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="modern-card">
                      <CardContent className="p-6 text-center text-slate-500">
                        No recent activity
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ContactInfo profile={profile} />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Profile Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Profile views</span>
                    <span className="font-semibold text-slate-900">{profile.profile_views || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Posts</span>
                    <span className="font-semibold text-slate-900">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Experience</span>
                    <span className="font-semibold text-slate-900">{experiences.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 