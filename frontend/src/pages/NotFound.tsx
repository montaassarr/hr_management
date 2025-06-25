import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="max-w-md w-full p-6">
        <CardHeader>
          <Alert variant="destructive">
            <AlertTitle>404 - Page Not Found</AlertTitle>
            <AlertDescription>
              Oops! The page <span className="font-mono">{location.pathname}</span> does not exist.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="text-center mt-4">
          <Button asChild variant="default">
            <a href="/">Return to Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
