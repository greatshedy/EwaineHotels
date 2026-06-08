import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl sm:text-9xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">Oops! The page you are looking for does not exist or has been moved.</p>
        <Link to="/"><Button variant="primary" size="lg"><Home className="w-5 h-5" /> Go Home</Button></Link>
      </motion.div>
    </div>
  );
}
