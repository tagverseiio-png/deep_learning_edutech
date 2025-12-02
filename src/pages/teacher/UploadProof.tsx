import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UploadProof = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success!",
      description: "Purchase proof uploaded successfully. Awaiting verification.",
    });
    setTimeout(() => {
      navigate("/teacher/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-secondary">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Upload Purchase Proof</CardTitle>
            <CardDescription>
              Upload your mobile stand purchase receipt or screenshot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="proof">Purchase Screenshot/Receipt</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {file && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-secondary border rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your proof will be reviewed within 24-48 hours</li>
                  <li>• You'll receive a notification once verified</li>
                  <li>• After verification, you can start uploading videos</li>
                </ul>
              </div>

              <Button type="submit" className="w-full">
                Submit for Verification
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default UploadProof;
