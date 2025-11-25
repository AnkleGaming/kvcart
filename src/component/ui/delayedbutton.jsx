// src/hooks/useDelayedNavigate.js
import { useNavigate } from "react-router-dom";

export function useDelayedNavigate() {
  const navigate = useNavigate();

  // this function you can call anywhere
  const delayedNavigate = async (to, delay = 2000) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    navigate(to);
  };

  return delayedNavigate;
}
