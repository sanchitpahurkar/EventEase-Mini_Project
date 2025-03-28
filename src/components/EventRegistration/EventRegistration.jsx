import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

const EventRegistration = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams(); // Extract eventId from route params

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    github: "",
    linkedin: "",
    nationality: "",
    college: "",
    paymentScreenshot: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload for payment screenshot
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          paymentScreenshot: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to register for this event.");
      return;
    }

    if (!eventId) {
      console.error("Invalid eventId:", eventId);
      alert("Invalid Event ID. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        ...formData,
        eventId, // Add eventId dynamically from route
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "registrations"), registrationData);
      alert("Registered successfully!");
      navigate(`/event/${eventId}`);
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-purple-100 flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/doodad.png')",
        backgroundSize: "500px",
        backgroundPosition: "left",
      }}
    >
      <div className="bg-white shadow-2xl rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-6">Event Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reusable Input Field Component */}
          {[
            { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name", required: true },
            { label: "Email", name: "email", type: "email", placeholder: "Enter your email", required: true },
            { label: "WhatsApp Number", name: "whatsapp", type: "tel", placeholder: "Enter WhatsApp number", required: true },
            { label: "GitHub Profile", name: "github", type: "url", placeholder: "Enter GitHub profile URL" },
            { label: "LinkedIn Profile", name: "linkedin", type: "url", placeholder: "Enter LinkedIn profile URL" },
            { label: "Nationality", name: "nationality", type: "text", placeholder: "Enter your nationality" },
            { label: "College/University", name: "college", type: "text", placeholder: "Enter college/university name" },
          ].map(({ label, name, type, placeholder, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                placeholder={placeholder}
                required={required}
              />
            </div>
          ))}

          {formData.paymentScreenshot && (
            <img
              src={formData.paymentScreenshot}
              alt="Payment Screenshot"
              className="w-full h-48 object-cover rounded-md mt-2"
            />
          )}

          {/* Upload Screenshot */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Payment Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              required
            />
            {loading && <p className="text-blue-500">Uploading...</p>}
          </div>

          <button
            type="submit"
            className={`mt-3 bg-gradient-to-r from-[#A084E8] to-[#8C72D4] text-white font-semibold py-2 px-6 text-lg rounded-lg shadow-md hover:shadow-xl hover:from-[#8C72D4] hover:to-[#705EBB] transition-all duration-300 w-full ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegistration;