import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import type { ApiError } from "@/types";

const CreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    duration: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Economics",
    "Psychology",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Thumbnail must be less than 10MB",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file",
        });
        return;
      }

      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Video must be less than 500MB",
        });
        return;
      }

      if (!file.type.startsWith('video/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a video file",
        });
        return;
      }

      setVideo(file);
    }
  };

  const uploadFile = async (file: File, type: 'thumbnail' | 'video'): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const response = await api.post(`/media/upload?type=${type}`, formDataUpload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Return relative path only
    return response.data.data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.duration) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (!thumbnail) {
      toast({
        variant: "destructive",
        title: "Thumbnail required",
        description: "Please upload a course thumbnail",
      });
      return;
    }

    if (!video) {
      toast({
        variant: "destructive",
        title: "Video required",
        description: "Please upload a course video",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload files first
      setUploading(true);
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(thumbnail, 'thumbnail'),
        uploadFile(video, 'video'),
      ]);
      setUploading(false);

      // Create course
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        thumbnailImage: thumbnailUrl,
        videoUrl: videoUrl,
      };

      await api.post('/courses', courseData);

      toast({
        title: "Course created!",
        description: "Your course has been created successfully. It will be reviewed before publishing.",
      });

      navigate("/teacher/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast({
        variant: "destructive",
        title: "Course creation failed",
        description: axiosError.response?.data?.message || "Failed to create course",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
  };

  const removeVideo = () => {
    setVideo(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create New Course</h1>
            <p className="text-muted-foreground">
              Share your knowledge by creating a 10-minute educational video course
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                    <CardDescription>
                      Provide basic details about your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Introduction to Algebra"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what students will learn in this course..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="10"
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                          min="1"
                          max="60"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="5"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Recommended: ₹5 for 10-minute videos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Section */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Thumbnail</CardTitle>
                    <CardDescription>
                      Upload an attractive image for your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!thumbnailPreview ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="thumbnail" className="cursor-pointer">
                          <span className="text-sm font-medium">Click to upload thumbnail</span>
                          <input
                            id="thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                            disabled={loading}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeThumbnail}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Video Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Video</CardTitle>
                    <CardDescription>
                      Upload your 10-minute educational video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!video ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="video" className="cursor-pointer">
                          <span className="text-sm font-medium">Click to upload video</span>
                          <input
                            id="video"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                            disabled={loading}
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          MP4, MOV up to 500MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Video className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{video.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(video.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeVideo}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {uploading ? "Uploading files..." : "Creating course..."}
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCourse;