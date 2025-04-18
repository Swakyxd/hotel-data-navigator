
import { useEffect, useState } from "react";

const Index = () => {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // This component will be replaced by the HTML content
    // It acts as a placeholder for the custom HTML/JS application
    setMessage("Please run the Node.js server to access the Hotel Data Navigator system.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Hotel Data Navigator</h1>
        <p className="text-xl text-gray-600 mb-6">{message}</p>
        <div className="text-left mt-8">
          <h2 className="text-xl font-semibold mb-2">Setup Instructions:</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Clone or download this project</li>
            <li>Navigate to the project directory in your terminal</li>
            <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npm install</code> to install dependencies</li>
            <li>Create a MySQL database using the provided schema</li>
            <li>Update the database connection details in server.js</li>
            <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npm start</code> to launch the server</li>
            <li>Open your browser and navigate to <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
