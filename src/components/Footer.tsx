import { Link } from "react-router-dom";
import { MessageCircle, GraduationCap } from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
                       <Link to="/" className="flex items-center space-x-2">
  <img src={logo} alt="EDUTECH Logo" className="h-8 w-8" />
  <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
    EDUTECH
  </span>
</Link>
              <GraduationCap className="h-6 w-6 text-primary" />
     

            </div>
            <p className="text-muted-foreground text-sm">
              Learn. Teach. Grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <a
              href="https://wa.me/9345266551"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EDUTECH. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
