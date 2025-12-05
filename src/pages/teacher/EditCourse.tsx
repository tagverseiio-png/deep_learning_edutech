import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Upload,
  Video,
  Image as ImageIcon,
  Loader2,
  Save,
  CheckCircle,
} from "lucide-react";
import { useCourse, useUpdateCourse, usePublishCourse } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getMediaUrl } from "@/lib/media";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  thumbnailImage?: string;
  videoUrl?: string;
}

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Other",
];

const EditCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: courseData, isLoading: isLoadingCourse } = useCourse(id || "");
  const updateMutation = useUpdateCourse();
  const publishMutation = usePublishCourse();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    price: 0,
    duration: 0,
    thumbnailImage: "",
    videoUrl: "",
  });

  const [isPublished, setIsPublished] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (courseData?.data) {
      const course = courseData.data;
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || 0,
        duration: course.duration || 0,
        thumbnailImage: course.thumbnailImage || course.thumbnail || "",
        videoUrl: course.videoUrl || "",
      });
      setIsPublished(course.isPublished || false);
    }
  }, [courseData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "duration" ? Number(value) : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleFileUpload = async (file: File, type: "thumbnail" | "video") => {
    const setUploading = type === "thumbnail" ? setUploadingThumbnail : setUploadingVideo;
    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await api.post(`/media/upload?type=${type}`, uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Store relative path only (not the full URL)
      const relativePath = response.data.data.path;
      
      setFormData((prev) => ({
        ...prev,
        [type === "thumbnail" ? "thumbnailImage" : "videoUrl"]: relativePath,
      }));

      toast({
        title: "Upload Successful",
        description: `${type === "thumbnail" ? "Thumbnail" : "Video"} uploaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: `Failed to upload ${type}. Please try again.`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      await updateMutation.mutateAsync({
        id,
        data: formData,
      });

      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully.",
      });

      navigate("/teacher/my-courses");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update course.",
      });
    }
  };

  const handlePublish = async () => {
    if (!id) return;

    try {
      await publishMutation.mutateAsync(id);
      setIsPublished(true);
      toast({
        title: "Course Published",
        description: "Your course is now visible to students.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: error.response?.data?.message || "Failed to publish course.",
      });
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading course...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Edit Course</h1>
              <p className="text-muted-foreground">
                Update your course information
              </p>
            </div>
            {!isPublished && (
              <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                {publishMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Publish Course
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic details of your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Complete Web Development Bootcamp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what students will learn..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 60"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 999"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Media</CardTitle>
                  <CardDescription>
                    Update thumbnail and video for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <Label>Course Thumbnail</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-48 h-28 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                        {formData.thumbnailImage ? (
                          <img
                            src={getMediaUrl(formData.thumbnailImage) || undefined}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="thumbnail-upload"
                          className="cursor-pointer"
                        >
                          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                            {uploadingThumbnail ? (
                              <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                            ) : (
                              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              {uploadingThumbnail
                                ? "Uploading..."
                                : "Click to upload thumbnail"}
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "thumbnail");
                          }}
                          disabled={uploadingThumbnail}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="space-y-2">
                    <Label>Course Video</Label>
                    <div className="flex items-start gap-4">
                      <div className="w-48 h-28 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                        {formData.videoUrl ? (
                          <video
                            src={getMediaUrl(formData.videoUrl) || undefined}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="video-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                            {uploadingVideo ? (
                              <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                            ) : (
                              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              {uploadingVideo
                                ? "Uploading..."
                                : "Click to upload video"}
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "video");
                          }}
                          disabled={uploadingVideo}
                        />
                      </div>
                    </div>
                    {formData.videoUrl && (
                      <p className="text-sm text-muted-foreground">
                        Video URL: {formData.videoUrl}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Published</Label>
                      <p className="text-sm text-muted-foreground">
                        {isPublished
                          ? "Your course is visible to students"
                          : "Your course is in draft mode"}
                      </p>
                    </div>
                    <Switch
                      checked={isPublished}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditCourse;
