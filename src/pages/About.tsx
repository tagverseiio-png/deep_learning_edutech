import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              About EDUTECH
            </h1>
            <p className="text-xl text-muted-foreground mb-12 text-center">
              Transforming education through bite-sized, quality learning experiences
            </p>

            <div className="prose prose-lg max-w-none mb-16">
              <p className="text-muted-foreground">
                EDUTECH is a revolutionary platform that connects verified teachers with eager students 
                through short, focused 10-minute learning videos. We believe that education should be 
                accessible, affordable, and effective.
              </p>
              <p className="text-muted-foreground">
                Our mission is to democratize quality education by enabling teachers to share their 
                expertise and students to learn at their own pace, all while maintaining the highest 
                standards of educational content.
              </p>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-card">
                <CardContent className="pt-6 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Quality First</h3>
                  <p className="text-muted-foreground">
                    Every teacher is verified to ensure the highest quality educational content
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                  <p className="text-muted-foreground">
                    Affordable learning at just ₹5 per video makes education accessible to all
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p className="text-muted-foreground">
                    10-minute format designed for optimal learning and retention
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
