import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Video, CheckCircle, Users, Clock, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Learn. Teach. Grow.
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
              Short 10-minute learning videos by verified teachers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Join as Student
                </Button>
              </Link>
              <Link to="/teacher/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 bg-accent hover:bg-accent/90">
                  <Users className="mr-2 h-5 w-5" />
                  Become a Teacher
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose EDUTECH?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-soft transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Short & Focused</h3>
                <p className="text-muted-foreground">
                  10-minute videos designed for maximum retention and learning efficiency
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-soft transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Teachers</h3>
                <p className="text-muted-foreground">
                  All teachers are verified and qualified to ensure quality content
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-soft transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Affordable Learning</h3>
                <p className="text-muted-foreground">
                  Access quality education at just ₹5 per video - learn at your own pace
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your account as a teacher or student in minutes
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Browse or Upload</h3>
                <p className="text-muted-foreground">
                  Students: Browse quality videos. Teachers: Share your knowledge
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Learn & Earn</h3>
                <p className="text-muted-foreground">
                  Students learn at affordable rates. Teachers earn from their content
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and teachers transforming education together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Learning
              </Button>
            </Link>
            <Link to="/teacher/register">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-black border-accent-foreground hover:bg-accent-foreground/10"
              >
                Start Teaching
              </Button>
            </Link>
          </div>
        </div>
      </section>
      

      <Footer />
    </div>
  );
};

export default Home;
