import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Video, Wallet, Star, BookMarked } from "lucide-react";

const StudentDashboard = () => {
  const demoVideos = [
    {
      id: 1,
      title: "Introduction to Mathematics",
      teacher: "Prof. John Doe",
      category: "Mathematics",
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
    },
    {
      id: 2,
      title: "Basic Physics Concepts",
      teacher: "Dr. Sarah Smith",
      category: "Physics",
      rating: 4.9,
      thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=225&fit=crop",
    },
    {
      id: 3,
      title: "English Grammar Essentials",
      teacher: "Ms. Emily Brown",
      category: "English",
      rating: 4.7,
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=225&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-muted-foreground">Explore and learn from quality educational videos</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for videos, topics, or teachers..."
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Purchased Videos</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <p className="text-2xl font-bold">₹50</p>
                  </div>
                  <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saved Videos</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <BookMarked className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Videos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Recommended Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoVideos.map((video) => (
                <Card key={video.id} className="shadow-card hover:shadow-soft transition-shadow overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-accent">₹5</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription>{video.teacher}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{video.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{video.rating}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Purchase Video</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
