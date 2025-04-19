
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { profileAPI } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
  bio?: string;
  title?: string;
  website?: string;
  linkedIn?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  profile?: {
    title?: string;
    bio?: string;
    website?: string;
    linkedIn?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
  user?: {
    name: string;
    email: string;
  };
  name?: string;
  email?: string;
  avatar?: {
    path: string;
  };
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    website: "",
    linkedIn: "",
    facebook: "",
    youtube: "",
    twitter: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await profileAPI.getProfile();
        const profileData = response.data.data.userProfile;
        setProfile(profileData);
        
        setFormData({
          name: profileData.name || "",
          title: profileData.profile?.title || "",
          bio: profileData.profile?.bio || "",
          website: profileData.profile?.website || "",
          linkedIn: profileData.profile?.linkedIn || "",
          facebook: profileData.profile?.facebook || "",
          youtube: profileData.profile?.youtube || "",
          twitter: profileData.profile?.twitter || ""
        });
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "Failed to load profile");
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await profileAPI.updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      
      // Refresh profile data after update
      const response = await profileAPI.getProfile();
      setProfile(response.data.data.userProfile);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        {!isEditing ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
                  {profile?.name?.charAt(0) || authUser?.name?.charAt(0) || "U"}
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold">{profile?.name || authUser?.name}</h2>
                  <p className="text-gray-600">{profile?.email || authUser?.email}</p>
                  {profile?.profile?.title && <p className="text-gray-600">{profile.profile.title}</p>}
                </div>
                <div className="ml-auto">
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-700">{profile?.profile?.bio || "No bio provided"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <span className="text-gray-500 mr-2">Email:</span>
                        <span>{profile?.email || authUser?.email}</span>
                      </p>
                      {profile?.profile?.website && (
                        <p className="flex items-center">
                          <span className="text-gray-500 mr-2">Website:</span>
                          <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.profile.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                    <div className="space-y-2">
                      {profile?.profile?.linkedIn && (
                        <p className="flex items-center">
                          <span className="text-gray-500 mr-2">LinkedIn:</span>
                          <a href={profile.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.profile.linkedIn}
                          </a>
                        </p>
                      )}
                      {profile?.profile?.twitter && (
                        <p className="flex items-center">
                          <span className="text-gray-500 mr-2">Twitter:</span>
                          <a href={profile.profile.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.profile.twitter}
                          </a>
                        </p>
                      )}
                      {profile?.profile?.facebook && (
                        <p className="flex items-center">
                          <span className="text-gray-500 mr-2">Facebook:</span>
                          <a href={profile.profile.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.profile.facebook}
                          </a>
                        </p>
                      )}
                      {profile?.profile?.youtube && (
                        <p className="flex items-center">
                          <span className="text-gray-500 mr-2">YouTube:</span>
                          <a href={profile.profile.youtube} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.profile.youtube}
                          </a>
                        </p>
                      )}
                      {!profile?.profile?.linkedIn && !profile?.profile?.twitter && !profile?.profile?.facebook && !profile?.profile?.youtube && (
                        <p className="text-gray-500">No social media links provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g. Software Developer"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Social Links</h3>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="linkedIn" className="block text-xs text-gray-500 mb-1">
                          LinkedIn
                        </label>
                        <input
                          id="linkedIn"
                          name="linkedIn"
                          value={formData.linkedIn}
                          onChange={handleInputChange}
                          className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="twitter" className="block text-xs text-gray-500 mb-1">
                          Twitter
                        </label>
                        <input
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleInputChange}
                          className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="facebook" className="block text-xs text-gray-500 mb-1">
                          Facebook
                        </label>
                        <input
                          id="facebook"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="youtube" className="block text-xs text-gray-500 mb-1">
                          YouTube
                        </label>
                        <input
                          id="youtube"
                          name="youtube"
                          value={formData.youtube}
                          onChange={handleInputChange}
                          className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
