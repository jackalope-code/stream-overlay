import axios from "axios";
import { useState } from "react";
import { env } from "./utils";

const routeUrl = env().routeUrl;

export const useAuth = () => {
  const [clientId, setClientId] = useState<string | undefined>();
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [authFailMessage, setAuthFailMessage] = useState("");

  // Authenticate from search params
  function authenticate(username: string, password: string) {
    // Login
    // TODO: Handle authentication failure with username/password
    (async () => {
      axios.post(`${routeUrl}/auth`, {
        username,
        password
      }).then(res => {
        setClientId(res.data.clientId);
        setAuthenticated(true);
      }).catch(error => {
        if(!error.response) {
          setAuthFailed(true);
          setAuthFailMessage("Failed to connect to the server.");
        }
      })
    })();
  }

  return {clientId, isAuthenticated, authFailed, authFailMessage, authenticate};
}