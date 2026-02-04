import React from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../context/UIContext";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Avtomatik ravishda login sahifasiga yo'naltirish
  React.useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Landing;
